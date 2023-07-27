import axios, { AxiosResponse } from 'axios';

interface TeraboxApiResponse {
  success: boolean;
  url: string;
}

export default async function bypassTeraboxFun(
  url: string
): Promise<TeraboxApiResponse> {
  //   if (!url.startsWith('https://terabox.fun')) {
  //     throw new Error('Invalid URL. The URL must start with "https://terabox.fun".');
  //   }

  const apiURL = 'https://api.hunternblz.com/terabox';
  const headers = {
    authority: 'api.hunternblz.com',
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    origin: 'https://teradood.hunternblz.com',
    referer: 'https://teradood.hunternblz.com/',
    'sec-ch-ua':
      '^\\^Not/A)Brand^\\^";v=^\\^99^\\^", ^\\^Microsoft Edge^\\^";v=^\\^115^\\^", ^\\^Chromium^\\^";v=^\\^115^\\^"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '^\\^Windows^\\^',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183',
    'x-web-build-number': '6069086861',
  };

  const data = new URLSearchParams();
  data.append('pesan', 'API INI BEBAS DIPAKAI');
  data.append('url', url);

  try {
    const response: AxiosResponse<TeraboxApiResponse> = await axios.post(
      apiURL,
      data.toString(),
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error making the API request:', error);
    throw error;
  }
}

// Example usage:
// const teraboxURL = 'https://terabox.fun/sl/3XCTVvgx6Y';
// bypassTeraboxFun(teraboxURL)
//   .then((data) => {
//     console.log(data); // { success: true, url: 'https://teraboxapp.com/s/1cg52TzuNvC1Fd-RHRqCXNA' }
//     // Handle the response data as needed
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//     // Handle errors here
//   });
