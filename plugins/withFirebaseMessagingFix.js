const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFirebaseMessagingFix(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest.application[0];

        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        // Find the default_notification_color metadata
        const notificationColorMetadata = mainApplication['meta-data'].find(
            (m) => m.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
        );

        if (notificationColorMetadata) {
            // Add tools:replace to override the conflict from @react-native-firebase/messaging
            notificationColorMetadata.$['tools:replace'] = 'android:resource';

            // Ensure the tools namespace is added to the manifest
            if (!androidManifest.manifest.$['xmlns:tools']) {
                androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
            }
        }

        return config;
    });
};
