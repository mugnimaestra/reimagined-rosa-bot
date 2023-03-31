import axios from 'axios';

const extractTeraboxDirectLink = async (url: string): Promise<string> => {
  let value_: string = url;
  if (url.includes('/shar')) {
    value_ = new URL(url).searchParams.get('surl') as string;
  }
  if (url.includes('/s/')) {
    const urlParts: string[] = url.split('/');
    value_ = urlParts[urlParts.length - 1];
  }
  if (value_.length === 23 && value_.startsWith('1')) {
    value_ = value_.slice(1);
  }
  try {
    const response = await axios.get(
      `https://trapi.iqbalrifai.eu.org/?id=${value_}`
    );
    const json = response.data;
    return json.list[0].dlink;
  } catch (error) {
    console.error(error);
    return '';
  }
};

export default extractTeraboxDirectLink;
