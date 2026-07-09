const { createClient } = require("@supabase/supabase-js");
const { WebSocket } = require("ws");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: {
      transport: WebSocket,
    },
  }
);

module.exports = supabase;