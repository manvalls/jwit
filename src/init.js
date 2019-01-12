import { hookAssets } from './defaultHooks';
import { initQueue } from './queue';
import wrapFactory from './wrapFactory';

export default wrapFactory(() => [
  initQueue(),
  hookAssets(),
]);