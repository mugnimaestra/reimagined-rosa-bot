import axios, { AxiosResponse } from "axios";

interface DoodStreamResponse {
  success: boolean;
  is_dir: boolean;
  data: {
    title: string;
    duration: string;
    size: string;
    date: string;
    thumbnail: string;
    direct_link: string;
  };
  referer: string;
}

async function bypassDoodStreamLink(url: string): Promise<DoodStreamResponse> {
  const apiUrl = "https://api.hunternblz.com/doodstream";
  const headers = {
    authority: "api.hunternblz.com",
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    origin: "https://teradood.hunternblz.com",
    referer: "https://teradood.hunternblz.com/",
    "sec-ch-ua":
      '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36 Edg/115.0.1901.188",
    "x-web-build-number": "6069086861",
  };
  const data = `pesan=API+INI+BEBAS+DIPAKAI&url=${encodeURIComponent(url)}`;

  try {
    const response: AxiosResponse<DoodStreamResponse> = await axios.post(
      apiUrl,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch DoodStream link");
  }
}

export default bypassDoodStreamLink;

// Usage example:
const url = "https://dooood.com/e/ejskhn4fo37o";
bypassDoodStreamLink(url)
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error.message);
  });
