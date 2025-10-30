const JSONBIN_API_KEY = process.env.NEXT_PUBLIC_JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID || '';

export async function getUsers() {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY,
    },
  });
  const data = await response.json();
  return data.record.users || [];
}

export async function getFriendRequests() {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY,
    },
  });
  const data = await response.json();
  return data.record.friendRequests || [];
}

export async function updateData(users: any[], friendRequests: any[]) {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify({ users, friendRequests }),
  });
  return response.json();
}
