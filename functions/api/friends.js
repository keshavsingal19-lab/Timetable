export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const rollNo = url.searchParams.get('rollNo')?.toUpperCase();

  if (!rollNo) {
    return new Response(JSON.stringify({ error: "Missing rollNo param" }), { status: 400 });
  }

  try {
    const db = env.DB;

    // Create tables dynamically if not exist
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS friendships (
        sender_roll TEXT,
        receiver_roll TEXT,
        status TEXT, -- 'pending', 'accepted', 'rejected'
        sent_at INTEGER, -- timestamp
        action_at INTEGER, -- timestamp
        PRIMARY KEY (sender_roll, receiver_roll)
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS friend_blocks (
        blocker_roll TEXT,
        blocked_roll TEXT,
        PRIMARY KEY (blocker_roll, blocked_roll)
      )
    `).run();

    // 1. Accepted Friends (UNION avoids duplicate rows from broad OR-join)
    const friendsQuery = await db.prepare(`
      SELECT p.roll_no, p.name, p.semester, p.section
      FROM friendships f
      JOIN student_profiles p ON p.roll_no = f.receiver_roll
      WHERE f.sender_roll = ? AND f.status = 'accepted'
      UNION
      SELECT p.roll_no, p.name, p.semester, p.section
      FROM friendships f
      JOIN student_profiles p ON p.roll_no = f.sender_roll
      WHERE f.receiver_roll = ? AND f.status = 'accepted'
    `).bind(rollNo, rollNo).all();

    // 2. Incoming Requests
    const incomingQuery = await db.prepare(`
      SELECT p.roll_no, p.name, f.sent_at
      FROM friendships f
      JOIN student_profiles p ON p.roll_no = f.sender_roll
      WHERE f.receiver_roll = ? 
        AND f.status = 'pending'
        AND f.sender_roll NOT IN (SELECT blocked_roll FROM friend_blocks WHERE blocker_roll = ?)
    `).bind(rollNo, rollNo).all();

    // 3. Outgoing Requests (Sent)
    const outgoingQuery = await db.prepare(`
      SELECT p.roll_no, p.name, f.sent_at
      FROM friendships f
      JOIN student_profiles p ON p.roll_no = f.receiver_roll
      WHERE f.sender_roll = ? 
        AND f.status = 'pending'
    `).bind(rollNo).all();

    // 4. Blocked Users
    const blockedQuery = await db.prepare(`
      SELECT b.blocked_roll AS roll_no, p.name
      FROM friend_blocks b
      JOIN student_profiles p ON p.roll_no = b.blocked_roll
      WHERE b.blocker_roll = ?
    `).bind(rollNo).all();

    return new Response(JSON.stringify({
      friends: friendsQuery.results || [],
      incomingRequests: incomingQuery.results || [],
      outgoingRequests: outgoingQuery.results || [],
      blocks: blockedQuery.results || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Database error: " + error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { action, senderRoll, receiverRoll } = await request.json();
    if (!action || !senderRoll || !receiverRoll) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const sender = senderRoll.toUpperCase();
    const receiver = receiverRoll.toUpperCase();
    const db = env.DB;
    const now = Math.floor(Date.now() / 1000);

    // Create tables dynamically if not exist
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS friendships (
        sender_roll TEXT,
        receiver_roll TEXT,
        status TEXT, -- 'pending', 'accepted', 'rejected'
        sent_at INTEGER,
        action_at INTEGER,
        PRIMARY KEY (sender_roll, receiver_roll)
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS friend_blocks (
        blocker_roll TEXT,
        blocked_roll TEXT,
        PRIMARY KEY (blocker_roll, blocked_roll)
      )
    `).run();

    if (action === "send_request") {
      if (sender === receiver) {
        return new Response(JSON.stringify({ error: "You cannot add yourself as a friend." }), { status: 400 });
      }

      // Check if receiver exists
      const profile = await db.prepare("SELECT name FROM student_profiles WHERE roll_no = ?").bind(receiver).first();
      if (!profile) {
        return new Response(JSON.stringify({ error: "Student profile not found. Verify the Roll Number." }), { status: 404 });
      }

      // Check if sender blocked receiver
      const senderBlocked = await db.prepare("SELECT 1 FROM friend_blocks WHERE blocker_roll = ? AND blocked_roll = ?").bind(sender, receiver).first();
      if (senderBlocked) {
        return new Response(JSON.stringify({ error: "You have blocked this student. Unblock them first." }), { status: 400 });
      }

      // Check if receiver blocked sender (silently mock success, don't write to friendships)
      const receiverBlocked = await db.prepare("SELECT 1 FROM friend_blocks WHERE blocker_roll = ? AND blocked_roll = ?").bind(receiver, sender).first();

      // Check accepted or pending friendships
      const existing = await db.prepare(`
        SELECT * FROM friendships 
        WHERE (sender_roll = ? AND receiver_roll = ?) OR (sender_roll = ? AND receiver_roll = ?)
      `).bind(sender, receiver, receiver, sender).first();

      if (existing) {
        if (existing.status === "accepted") {
          return new Response(JSON.stringify({ error: "You are already friends with this student." }), { status: 400 });
        }
        if (existing.status === "pending") {
          if (existing.sender_roll === sender) {
            return new Response(JSON.stringify({ error: "Friend request already sent." }), { status: 400 });
          } else {
            // Outgoing pending request from receiver to sender exists, auto-accept it!
            await db.prepare(`
              UPDATE friendships 
              SET status = 'accepted', action_at = ? 
              WHERE sender_roll = ? AND receiver_roll = ?
            `).bind(now, receiver, sender).run();
            return new Response(JSON.stringify({ success: true, message: "You are now friends!" }), { status: 200 });
          }
        }
      }

      // Check cooling-off period of 3 days after rejection
      const rejected = await db.prepare(`
        SELECT action_at FROM friendships 
        WHERE sender_roll = ? AND receiver_roll = ? AND status = 'rejected' AND action_at > ?
      `).bind(sender, receiver, now - 3 * 86400).first();

      if (rejected) {
        const secondsLeft = rejected.action_at + 3 * 86400 - now;
        const daysLeft = Math.ceil(secondsLeft / 86400);
        return new Response(JSON.stringify({ 
          error: `Your request was rejected. You can send request again in ${daysLeft} day(s).` 
        }), { status: 400 });
      }

      // Check friends limit for sender (max 10)
      const senderFriendsCount = await db.prepare(`
        SELECT COUNT(*) AS count FROM friendships 
        WHERE (sender_roll = ? OR receiver_roll = ?) AND status = 'accepted'
      `).bind(sender, sender).first();

      if (senderFriendsCount && senderFriendsCount.count >= 10) {
        return new Response(JSON.stringify({ error: "Friend limit reached. You cannot have more than 10 friends." }), { status: 400 });
      }

      // Check friends limit for receiver (max 10)
      const receiverFriendsCount = await db.prepare(`
        SELECT COUNT(*) AS count FROM friendships 
        WHERE (sender_roll = ? OR receiver_roll = ?) AND status = 'accepted'
      `).bind(receiver, receiver).first();

      if (receiverFriendsCount && receiverFriendsCount.count >= 10) {
        return new Response(JSON.stringify({ error: "This student has reached their limit of 10 friends." }), { status: 400 });
      }

      // Check daily request limit for sender (max 5 requests in 24 hours)
      const dailyRequestsCount = await db.prepare(`
        SELECT COUNT(*) AS count FROM friendships 
        WHERE sender_roll = ? AND sent_at > ?
      `).bind(sender, now - 86400).first();

      if (dailyRequestsCount && dailyRequestsCount.count >= 5) {
        return new Response(JSON.stringify({ error: "Daily limit reached. You can send at most 5 friend requests in 24 hours." }), { status: 400 });
      }

      // If receiver blocked sender, mock success but DO NOT save anything
      if (receiverBlocked) {
        // We still count it towards daily limit? We just return success.
        // Since we didn't insert a row in friendships, it won't be in database, 
        // but we won't count mock success towards DB dailyRequestsCount either unless we insert a mocked row,
        // which isn't necessary.
        return new Response(JSON.stringify({ success: true, message: "Friend request sent successfully!" }), { status: 200 });
      }

      // Insert pending request
      await db.prepare(`
        INSERT INTO friendships (sender_roll, receiver_roll, status, sent_at, action_at)
        VALUES (?, ?, 'pending', ?, 0)
        ON CONFLICT(sender_roll, receiver_roll) DO UPDATE SET status = 'pending', sent_at = ?, action_at = 0
      `).bind(sender, receiver, now, now).run();

      return new Response(JSON.stringify({ success: true, message: "Friend request sent successfully!" }), { status: 200 });
    }

    if (action === "accept_request") {
      // Check limits before accepting
      const senderFriendsCount = await db.prepare(`
        SELECT COUNT(*) AS count FROM friendships 
        WHERE (sender_roll = ? OR receiver_roll = ?) AND status = 'accepted'
      `).bind(sender, sender).first();

      if (senderFriendsCount && senderFriendsCount.count >= 10) {
        return new Response(JSON.stringify({ error: "The requester has reached their limit of 10 friends." }), { status: 400 });
      }

      const receiverFriendsCount = await db.prepare(`
        SELECT COUNT(*) AS count FROM friendships 
        WHERE (sender_roll = ? OR receiver_roll = ?) AND status = 'accepted'
      `).bind(receiver, receiver).first();

      if (receiverFriendsCount && receiverFriendsCount.count >= 10) {
        return new Response(JSON.stringify({ error: "You cannot have more than 10 friends. Remove a friend first." }), { status: 400 });
      }

      await db.prepare(`
        UPDATE friendships 
        SET status = 'accepted', action_at = ?
        WHERE sender_roll = ? AND receiver_roll = ?
      `).bind(now, sender, receiver).run();

      return new Response(JSON.stringify({ success: true, message: "Friend request accepted!" }), { status: 200 });
    }

    if (action === "reject_request") {
      await db.prepare(`
        UPDATE friendships 
        SET status = 'rejected', action_at = ?
        WHERE sender_roll = ? AND receiver_roll = ?
      `).bind(now, sender, receiver).run();

      return new Response(JSON.stringify({ success: true, message: "Friend request rejected." }), { status: 200 });
    }

    if (action === "remove_friend") {
      await db.prepare(`
        DELETE FROM friendships 
        WHERE (sender_roll = ? AND receiver_roll = ?) OR (sender_roll = ? AND receiver_roll = ?)
      `).bind(sender, receiver, receiver, sender).run();

      return new Response(JSON.stringify({ success: true, message: "Friend removed." }), { status: 200 });
    }

    if (action === "block_user") {
      // Add block
      await db.prepare(`
        INSERT OR IGNORE INTO friend_blocks (blocker_roll, blocked_roll)
        VALUES (?, ?)
      `).bind(sender, receiver).run();

      // Delete any existing relationships or requests
      await db.prepare(`
        DELETE FROM friendships 
        WHERE (sender_roll = ? AND receiver_roll = ?) OR (sender_roll = ? AND receiver_roll = ?)
      `).bind(sender, receiver, receiver, sender).run();

      return new Response(JSON.stringify({ success: true, message: "User blocked permanently." }), { status: 200 });
    }

    if (action === "unblock_user") {
      await db.prepare(`
        DELETE FROM friend_blocks 
        WHERE blocker_roll = ? AND blocked_roll = ?
      `).bind(sender, receiver).run();

      return new Response(JSON.stringify({ success: true, message: "User unblocked." }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Database error: " + error.message }), { status: 500 });
  }
}
