import { hook } from './hook';
import { ScriptHook, LinkHook } from './defaultHooks';
import { initQueue } from './queue';
import callbackGroup from './callbackGroup';

export default (cb) => {
  const cg = callbackGroup(cb)
  
  initQueue()
  hook(ScriptHook, cg())
  hook(LinkHook, cg())
};