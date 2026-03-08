const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

function withAndroidSigning(config) {
    // 1. Add signing properties to gradle.properties
    config = withGradleProperties(config, (config) => {
        const properties = [
            { key: 'MYAPP_RELEASE_STORE_FILE', value: '../../credentials/ekadashi-din.keystore' },
            { key: 'MYAPP_RELEASE_KEY_ALIAS', value: 'ekadashi-key-alias' },
            { key: 'MYAPP_RELEASE_STORE_PASSWORD', value: 'EkadashiDin@2025' },
            { key: 'MYAPP_RELEASE_KEY_PASSWORD', value: 'EkadashiDin@2025' },
        ];

        properties.forEach(({ key, value }) => {
            // Remove existing to avoid duplication
            config.modResults = config.modResults.filter((prop) => prop.key !== key);
            config.modResults.push({ type: 'property', key, value });
        });

        return config;
    });

    // 2. Modify app/build.gradle
    config = withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = addSigningConfig(config.modResults.contents);
        }
        return config;
    });

    return config;
}

function addSigningConfig(content) {
    // 1. Add release signing config to signingConfigs block if it doesn't exist
    if (!content.includes('signingConfigs.release')) {
        const debugBlockMatch = content.match(/debug\s*{[\s\S]*?}/);
        if (debugBlockMatch) {
            const releaseBlock = `
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }`;
            content = content.replace(debugBlockMatch[0], `${debugBlockMatch[0]}${releaseBlock}`);
        }
    }

    // 2. Ensure buildTypes have correct signingConfigs
    const buildTypesMatch = content.match(/buildTypes\s*{[\s\S]*?}/);
    if (buildTypesMatch) {
        let buildTypesContent = buildTypesMatch[0];

        // Ensure debug uses debug
        buildTypesContent = buildTypesContent.replace(
            /(debug\s*{[\s\S]*?signingConfig\s+signingConfigs\.)\w+/,
            '$1debug'
        );

        // Ensure release uses release
        buildTypesContent = buildTypesContent.replace(
            /(release\s*{[\s\S]*?signingConfig\s+signingConfigs\.)\w+/,
            '$1release'
        );

        content = content.replace(buildTypesMatch[0], buildTypesContent);
    }

    return content;
}

module.exports = withAndroidSigning;
