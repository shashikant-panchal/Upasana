import axios from 'axios';
import Constants from 'expo-constants';
import SpInAppUpdates from 'sp-react-native-in-app-updates';

class StoreService {
    async getStoreMetadata() {
        const packageName = Constants.expoConfig?.android?.package || 'com.EkadashiDin.app';
        const storeUrl = `https://play.google.com/store/apps/details?id=${packageName}&hl=en&gl=US`;

        let metadata = {
            version: Constants.expoConfig?.version || '1.0.0',
            lastUpdated: 'Dec 17, 2025',
            isLive: false
        };

        try {
            const inAppUpdates = new SpInAppUpdates(false);
            const updateRes = await inAppUpdates.checkNeedsUpdate({
                curVersion: metadata.version,
            }).catch(err => {
                console.log("Play Core check failed (expected in debug):", err);
                return null;
            });

            if (updateRes && updateRes.storeVersion) {
                metadata.version = updateRes.storeVersion;
                metadata.isLive = true;
            }

            const response = await axios.get(storeUrl, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.status === 200) {
                metadata.isLive = true;
                const html = response.data;

                const updatedOnMatch = html.match(/Updated on<\/div>.*?<div.*?>(.*?)<\/div>/i) ||
                    html.match(/Updated on.*?([A-Z][a-z]+ [0-9]+, [0-9]{4})/);

                if (updatedOnMatch && updatedOnMatch[1]) {
                    metadata.lastUpdated = updatedOnMatch[1];
                }

                if (!updateRes || !updateRes.storeVersion) {
                    const versionMatch = html.match(/Version<\/div>.*?<div.*?>(.*?)<\/div>/i);
                    if (versionMatch && versionMatch[1]) {
                        metadata.version = versionMatch[1].trim();
                    }
                }
            }
        } catch (error) {
            console.log("Store metadata fetch error:", error.message);
        }

        return metadata;
    }
}

export default new StoreService();
