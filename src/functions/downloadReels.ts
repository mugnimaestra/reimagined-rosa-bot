import axios from 'axios';

const getReelsVideoUrl = async (reelUrl: string) => {
  try {
    const response = await axios.post(
      'https://api.instavideosave.com/allinone',
      null,
      {
        headers: {
          authority: 'api.instavideosave.com',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          origin: 'https://instavideosave.net',
          referer: 'https://instavideosave.net/',
          'sec-ch-ua':
            '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': 'Windows',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          url: reelUrl,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      }
    );
    console.log('the response', response);
    const videoUrl = response?.data?.video?.[0]?.video;
    return videoUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const downloadReels = async (downloadUrl: string) => {
  const url = await getReelsVideoUrl(downloadUrl);
  return url;
};

export default downloadReels;
