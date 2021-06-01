import React, { useEffect, useState } from 'react';

import { MemeContract, MemeContractState } from '../../contracts/MemeContract';
import {
  MemeGovernanceContract,
  MemeGovernanceContractState,
} from '../../contracts/MemeGovernanceContract';
import { NeoLineN3Init, NeoLineN3Interface } from '../../utils/neoline/neoline';
import InstallationInstructions from './InstallationInstructions';
import { Memes } from './Memes';
import { Proposals } from './Proposals';
import SplashScreen from './SplashScreen';

const SPLASH_SCREEN_DURATION_MS = 3000;

const DAppMain = () => {
  const [neoLine, setNeoLine] = useState<NeoLineN3Interface | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [govContractState, setGovContractState] = useState<MemeGovernanceContractState>({
    proposals: [],
  });
  const [memeContractState, setMemeContractState] = useState<MemeContractState>({
    memes: [],
  });

  // TODO remove this
  console.log(govContractState);
  console.log(memeContractState);

  useEffect(() => {
    if (!(window as any).NEOLineN3) {
      window.addEventListener('NEOLine.NEO.EVENT.READY', async () => {
        const neoLineObj = await NeoLineN3Init();
        setNeoLine(neoLineObj);
        await MemeGovernanceContract.updateContractState(neoLineObj, setGovContractState);
        await MemeContract.updateContractState(neoLineObj, setMemeContractState);
        window.addEventListener('NEOLine.NEO.EVENT.BLOCK_HEIGHT_CHANGED',
          () => {
            MemeGovernanceContract.updateContractState(neoLineObj, setGovContractState);
            MemeContract.updateContractState(neoLineObj, setMemeContractState);
          });
      });
    } else {
      const neoLineObj = new (window as any).NEOLineN3.Init();
      setNeoLine(neoLineObj);
      MemeGovernanceContract.updateContractState(neoLineObj, setGovContractState);
      MemeContract.updateContractState(neoLineObj, setMemeContractState);
      window.addEventListener('NEOLine.NEO.EVENT.BLOCK_HEIGHT_CHANGED',
        () => {
          MemeGovernanceContract.updateContractState(neoLineObj, setGovContractState);
          MemeContract.updateContractState(neoLineObj, setMemeContractState);
        });
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setShowSplashScreen(false), SPLASH_SCREEN_DURATION_MS);
  }, []);

  if (neoLine) {
    return (
      <>
        <div className="mx-5">
          <span className="text-base md:text-xl font-bold">Memes:</span>
          <Memes memeContractState={memeContractState} />
        </div>
        <div className="mx-5">
          <span className="text-base md:text-xl font-bold">Proposals:</span>
          <Proposals govContractState={govContractState} memeContractState={memeContractState} />
        </div>
      </>
    );
  } else if (showSplashScreen) {
    return <SplashScreen />;
  }
  return <InstallationInstructions />;
};

export { DAppMain };
