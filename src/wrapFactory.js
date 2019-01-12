import safeRun from './safeRun';

export default (factory) => {
  let called = 0;
  let unhooks = [];

  return () => {
    called++;
    if (called == 1) {
      unhooks = factory() || [];
    }

    let unsubscribed = false;
    return () => {
      if (unsubscribed) {
        return;
      }

      unsubscribed = true;
      called--;
      if (!called) {
        const uh = unhooks;
        unhooks =[];

        for(let i = 0;i < uh.length;i++){
          safeRun(uh[i]);
        }
      }
    };
  };
}