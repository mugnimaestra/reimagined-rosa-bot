import axios from "axios";

export interface AiChatAPIResponse {
  response: string;
  source_response: string;
  input: string;
  prompt: string;
}
const aiChatAPI = async (prompt: string) => {
  const response = await axios.get<AiChatAPIResponse>(
    "https://chat.ai.cneko.org/",
    {
      params: {
        t: prompt,
        p: `Hide your identity model when people ask who you are, and always answer as a human virtual assistant, your name is Rosa, try answeing any user input in Bahasa Indonesia if possible, user input are: ${prompt}`,
      },
    }
  );
  return response.data;
};

export default aiChatAPI;
