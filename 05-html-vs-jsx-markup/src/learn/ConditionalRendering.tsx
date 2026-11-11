import reactImagePath from '@/assets/react.svg';
import viteImagePath from '@/assets/vite.svg';
import nextImagePath from '@/assets/next-js.svg';
import kakaoImagePath from '@/assets/kakao-talk.svg';
import isTrueOrFalse from '@/utils/isTrueOrFalse';
import type { PropsWithChildren } from 'react';
//import type React from 'react';



interface Props {
  imageType: string;
  //children?: React.ReactNode;
  //children?: React.ReactElement;
  //children?: React.JSX.Element
}

function ConditionalRendering({imageType}:PropsWithChildren<Props>) {

  let imagePath = '';
  let printText;

  switch (imageType.toLowerCase()) {
    case 'react':
      imagePath = reactImagePath;
      printText = 'React';
      break;
    case 'vite':
      imagePath = viteImagePath;
      printText = 'vite';
      break;
    case 'next.js':
      imagePath = nextImagePath;
      printText = 'next.js';
      break;
    case 'kakao talk':
      imagePath = kakaoImagePath;
      printText = 'kakao talk';
      break;
    default:
      printText = '허용된 이미지 타입이 존재하지 않습니다.';
  }

  
  const isShowSpinner = isTrueOrFalse();

  const spinnerOrVite = 
  isShowSpinner ? 
    (<img className='spinner' src='/icons/spinner.svg' alt='로딩 중...'/>) :
    (<img src='/vite.svg' alt='vite logo'/>);

        //     {
        //   isShowSpinner ? <img className='spinner' src="/icons/spinner.svg" alt="로딩 중..." />
        //   : <img src="/vite.svg" alt="vite logo" />
        // }
  
  
  return (
    <>
      <dt>
        조건부 랜더링(ConditionalRendering) ({isShowSpinner && '스피너표시'})
        <hr />
        React - 이 데이터는 {undefined}입니다.
        <hr />
        JS - {`이 데이터는 ${undefined} 입니다.`}
      </dt>
      <dd>
        <p>이미지 타입(image type)에 따라 랜더링 여부를 결정합니다.</p>
        <div className="conditionalRendering">
          { imagePath && <img src={imagePath} alt="" /> }
          <p>{printText}</p>
        </div>
      </dd>
      <dd style={{marginTop: 12}}>
        <p>spinner 또는 vite 이미지가 랜덤으로 화면에 랜더링 되도록 합니다.</p>
        <div className='conditionalRendering'> {spinnerOrVite} </div>
      </dd>
    </>
  )
}
export default ConditionalRendering