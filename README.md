# Logical Connectives

[![Netlify Status](https://api.netlify.com/api/v1/badges/20e36adb-153e-42fe-b91e-b755d7d60c06/deploy-status)](https://app.netlify.com/projects/damonzucconi-logical-connectives/deploys)

## Meta

- **State**: production
- **Production**:
  - **URL**: https://logical-connectives.work.damonzucconi.com/
  - **URL**: https://damonzucconi-logical-connectives.netlify.app/
- **Host**: https://app.netlify.com/projects/damonzucconi-logical-connectives/deploys
- **Deploys**: Merged PRs to `main` are automatically deployed to production. [Manually trigger a deploy](https://app.netlify.com/projects/damonzucconi-logical-connectives/deploys)

## Parameters

| Param                                          | Description                                           | Type                               | Default        |
| ---------------------------------------------- | ----------------------------------------------------- | ---------------------------------- | -------------- |
| `evolutionConfig.minDepth`                     | Minimum recursion depth target                        | `number`                           | `4`            |
| `evolutionConfig.maxDepth`                     | Maximum recursion depth target                        | `number`                           | `12`           |
| `evolutionConfig.heightTarget`                 | Desired vertical fill ratio of available space        | `number`                           | `0.95`         |
| `evolutionConfig.forceFlipAfterSteps`          | Max unchanged-value steps before forcing a truth flip | `number`                           | `10`           |
| `evolutionConfig.initialDepth`                 | Initial recursion depth on startup                    | `number`                           | `6`            |
| `evolutionConfig.clickTargetDepthOptions`      | Depth options sampled on click                        | `number[]`                         | `[5, 6, 7, 8]` |
| `evolutionConfig.targetDepthNudgeChoices`      | Random depth adjustment step values                   | `number[]`                         | `[-1, 1]`      |
| `evolutionConfig.randomBoolThreshold`          | Threshold for random boolean generation               | `number`                           | `0.5`          |
| `evolutionConfig.targetDepthRandomNudgeChance` | Chance of random depth nudge per step                 | `number`                           | `0.12`         |
| `layoutConfig.minFontSize`                     | Minimum readable font size when constraining          | `number`                           | `14`           |
| `layoutConfig.fitFontMinPx`                    | Lower bound for binary-search fit                     | `number`                           | `1`            |
| `layoutConfig.fitFontTolerancePx`              | Binary-search precision tolerance                     | `number`                           | `0.5`          |
| `layoutConfig.fontSizeRecoveryBuffer`          | Additional headroom before shrinking depth            | `number`                           | `1`            |
| `tempoConfig.stepMs`                           | Base update interval (ms)                             | `number`                           | `110`          |
| `tempoConfig.stepMsMin`                        | Minimum update interval (ms)                          | `number`                           | `55`           |
| `tempoConfig.stepMsMax`                        | Maximum update interval (ms)                          | `number`                           | `240`          |
| `tempoConfig.burstChance`                      | Chance to enter fast burst mode                       | `number`                           | `0.08`         |
| `tempoConfig.lullChance`                       | Chance to enter slow lull mode                        | `number`                           | `0.05`         |
| `audioConfig.enabled`                          | Global sound feature toggle                           | `boolean`                          | `true`         |
| `audioConfig.mainPreset`                       | Main true/false transition preset                     | `"classic" \| "chime" \| "arcade"` | `"arcade"`     |
| `audioConfig.microPreset`                      | Secondary non-flip tick preset                        | `"classic" \| "chime" \| "arcade"` | `"arcade"`     |
| `audioConfig.masterGain`                       | Master gain scalar for all generated tones            | `number`                           | `0.05`         |
| `audioConfig.microGainMultiplier`              | Gain multiplier for non-flip micro ticks              | `number`                           | `0.45`         |
| `uiConfig.idleMs`                              | Idle timeout before cursor/speaker fade (ms)          | `number`                           | `1800`         |
