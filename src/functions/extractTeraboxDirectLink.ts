import axios, { AxiosResponse } from 'axios';

interface TeraboxDirectLink {
  filename: string;
  filesize: string;
  date: string;
  direct_link: string;
}

interface TeraboxApiResponse {
  success: boolean;
  data: {
    username: string;
    list: TeraboxDirectLink[];
  };
}

export default async function extractTeraboxDirectLink(
  url: string
): Promise<TeraboxApiResponse> {
  const apiUrl = 'https://api.hunternblz.com/terabox';
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
      apiUrl,
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
// const teraboxURL = 'https://teraboxapp.com/s/1cg52TzuNvC1Fd-RHRqCXNA';
// extractTeraboxDirectLink(teraboxURL)
//   .then((data) => {
//     console.log(data);
//     /*
//     {
//       success: true,
//       data: {
//         username: 'x**0u',
//         list: [
//           {
//             filename: 'e_s2_e.rar',
//             filesize: '709.25 MB',
//             date: '2023-07-22 05:09',
//             direct_link: 'https://d.4funbox.com/file/7d704309841db510140d1aaae312a35f?fid=4400758739895-250528-962527272793665&dstime=1690468475&expires=1690483000&rt=sh&chkv=1&sign=FDtERVA-DCb740ccc5511e5e8fedcff06b081203-xWp4pFPA4mhdlbcoJ7I8JI5wTAg%3D&r=936265259&sharesign=8Tm3gZXDulYn6sya/BQqAb5ojDlCCdIevk6OB1nchiAUaq4nNxaQ15JSedsTcL4HG63Ny1W599Btewmst2cpDfeuNG+uqOdPzspCUxkt9/wO5WmSW1ZUwYSZ+qZk4xIXfkLOR2WzFOONf59SPn3ie5xwajpXstpaIQDH9QyQQe71oqSI/RcLDyF6c7zlKz1fYFMOdPJjIUcsENawI9k2Xkhrc6hzoYnUWW74Az4Y8XfczU2T48OCrOPZJKql6gg3CF44hkdDB7vNBDcHNIWZ/A867PbY8oMFMRKogZkk5Jy/A2BG3YbeOLQDGnR0wLIu&sh=1'
//           }
//         ]
//       }
//     }
//     */
//     // Handle the response data as needed
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//     // Handle errors here
//   });
