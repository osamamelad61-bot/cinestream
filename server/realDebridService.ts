import axios from 'axios';

const REAL_DEBRID_BASE_URL = 'https://api.real-debrid.com/rest/1.0';

export class RealDebridService {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: REAL_DEBRID_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async resolveMagnet(magnet: string): Promise<string> {
    try {
      console.log('[Real-Debrid] Resolving magnet link...');
      const addParams = new URLSearchParams();
      addParams.append('magnet', magnet);
      const addRes = await this.client.post('/torrents/addMagnet', addParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const torrentId = addRes.data.id;
      console.log(`[Real-Debrid] Torrent added, ID: ${torrentId}`);
      
      let info = await this.client.get(`/torrents/info/${torrentId}`);
      
      if (info.data.status === 'waiting_files_selection') {
        console.log('[Real-Debrid] Selecting files...');
        const selectParams = new URLSearchParams();
        selectParams.append('files', 'all');
        await this.client.post(`/torrents/selectFiles/${torrentId}`, selectParams.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        for(let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 1500));
            info = await this.client.get(`/torrents/info/${torrentId}`);
            console.log(`[Real-Debrid] Waiting for download, status: ${info.data.status}`);
            if(info.data.status === 'downloaded' || info.data.status === 'magnet_conversion') break;
            if(info.data.status === 'error' || info.data.status === 'dead') break;
        }
      }

      if (info.data.status !== 'downloaded') {
          throw new Error(`Torrent is not cached on Real-Debrid. Current status: ${info.data.status}`);
      }
      
      if (!info.data.links || info.data.links.length === 0) {
          throw new Error('Real-Debrid: No downloadable links found in this torrent.');
      }
      
      const unrestrictParams = new URLSearchParams();
      unrestrictParams.append('link', info.data.links[0]);
      
      try {
        const unRes = await this.client.post('/unrestrict/link', unrestrictParams.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        return unRes.data.download;
      } catch (unError: any) {
        console.error('Real-Debrid Unrestrict Error:', unError.response?.data || unError.message);
        throw new Error(`Failed to unrestrict link: ${unError.response?.data?.error || unError.message}`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error('Real-Debrid Error:', errorMsg);
      throw new Error(`Debrid Error: ${errorMsg}`);
    }
  }
}
