import tw from "@/utils/tw";
import { memo } from "react";

interface Props {
  children:React.ReactNode;
  href: string;
  isExternal?:boolean;
  className?:string
}

function AppLink({children, href, isExternal, className, ...restProps}:Props) {

  const externalProps = isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {};
  
  return (
    <>
      <a 
        href={href}
        className={tw('text-indigo-500 hover:text-accent',className)}
        {...externalProps}
        {...restProps}
      >
        {children}
      </a>
    </>
  )
}
export default memo(AppLink);

