import axios from 'axios';

interface TeraboxRawResponse {
  errno: number;
  request_id: number;
  server_time: number;
  cfrom_id: number;
  title: string;
  list: List[];
  share_id: number;
  uk: number;
}

interface List {
  category: string;
  fs_id: string;
  isdir: string;
  local_ctime: string;
  local_mtime: string;
  md5: string;
  path: string;
  play_forbid: string;
  server_ctime: string;
  server_filename: string;
  server_mtime: string;
  size: string;
  dlink: string;
  emd5: string;
}

interface TeraboxLinkInfo {
  directUrl: string;
  rawResponse: TeraboxRawResponse | null;
}

const extractTeraboxDirectLink = async (
  url: string
): Promise<TeraboxLinkInfo> => {
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
    const directUrl = json.list[0].dlink;
    return { directUrl, rawResponse: response.data };
  } catch (error) {
    console.error(error);
    return { directUrl: '', rawResponse: null };
  }
};

export default extractTeraboxDirectLink;
