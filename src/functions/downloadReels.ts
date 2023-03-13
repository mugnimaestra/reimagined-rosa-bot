import axios from 'axios';

const downloadReels = async (downloadUrl: string) => {
  const saveinApiUrl = `https://savein.io/api/reels?url=${encodeURIComponent(
    downloadUrl
  )}`;
  const savefromApiUrl = `https://en.savefrom.net/18/#url=${encodeURIComponent(
    downloadUrl
  )}`;

  const downloadLink = await axios
    .get(saveinApiUrl)
    .then(res => {
      const downloadUrl = res.data.downloadUrl;
      console.log('downloadUrl savein', downloadUrl);
      return axios.get(
        `${savefromApiUrl}&sf_format=mp4&force_without_extension=1`
      );
    })
    .then(res => {
      console.log('from savefrom', res.data.link);
      return res.data.link;
    })
    .catch(err => {
      console.log('error', err);
    });

  return downloadLink;
};

export default downloadReels;
