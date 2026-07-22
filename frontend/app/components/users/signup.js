export default async function handler(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
      }
  
      const { email, password, name, nickname, role, picture, inviteCode } = req.body;
  
      console.log("Signup payload:", req.body); // 👈 no output
  
      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Required fields missing' });
      }
  
      try {
        const user = await localAuthService.register({
          email,
          password,
          name,
          nickname,
          role,
          picture,
          inviteCode: inviteCode || "",
        });
  
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } catch (error) {
      console.error("Error in signup handler:", error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  
  export const config = {
    api: {
      bodyParser: true,
    },
  };
  