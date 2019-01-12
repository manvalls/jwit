import { hookAssets } from './defaultHooks';
import { initQueue } from './queue';

export default () => {
  initQueue();
  hookAssets();
};