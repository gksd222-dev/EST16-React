import * as learnData from '@/data/learn';
import type { JSX } from "react/jsx-runtime"
import DataBinding from './DataBinding';
// import JSXAttributes from './JSXAttributes';
import ConditionalRendering from './ConditionalRendering';
import ConditionalDisplay from './ConditionalDisplay';
import RenderList from './RenderList';



function JSX_Markup():JSX.Element {

  const {
    statusMessage,
    imageType,
    reactLibrary,
    isShowReactImage,
    statusMessagesWithID,

  } = learnData;
  
  
  return (
    <dl className="descriptionList">

      <DataBinding statusMessages={statusMessage}/>
      {/* <JSXAttributes /> */}
      <ConditionalRendering imageType={imageType}>
        <h1></h1>
      </ConditionalRendering>
      <ConditionalDisplay isShowReactImage={isShowReactImage} />
      <RenderList items={statusMessagesWithID} reactLibrary={reactLibrary} />
    </dl>
  )
}

export default JSX_Markup


