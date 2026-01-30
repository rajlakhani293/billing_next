import React from "react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as FiIcons from "react-icons/fi";
import * as LuIcons from "react-icons/lu";
import * as TbIcons from "react-icons/tb";
import * as WiIcons from "react-icons/wi";
import * as DiIcons from "react-icons/di";
import * as GrIcons from "react-icons/gr";
import * as GiIcons from "react-icons/gi";
import * as GoIcons from "react-icons/go";
import * as FcIcons from "react-icons/fc";
import * as CgIcons from "react-icons/cg";
import * as BsIcons from "react-icons/bs";
import * as VscIcons from "react-icons/vsc";
import * as TfiIcons from "react-icons/tfi";
import * as SlIcons from "react-icons/sl";
import * as SiIcons from "react-icons/si";
import * as RiIcons from "react-icons/ri";
import * as LiaIcons from "react-icons/lia";
import * as PiIcons from "react-icons/pi";
import * as Io5Icons from "react-icons/io5";
import * as IoIcons from "react-icons/io";
import * as Hi2Icons from "react-icons/hi2";
import * as HiIcons from "react-icons/hi";
import * as ImIcons from "react-icons/im";

// Define the type for the props that the icons will accept.
type IconProps = {
  className?: string;
  size?: number | string;
  color?: string;
};

// A comprehensive mapping of library prefixes to their imported entities.
const iconLibraries: Record<string, Record<string, React.ComponentType<IconProps>>> = {
  Fa: FaIcons,
  Md: MdIcons,
  Ai: AiIcons,
  Bi: BiIcons,
  Fi: FiIcons,
  Lu: LuIcons,
  Tb: TbIcons,
  Wi: WiIcons,
  Di: DiIcons,
  Gr: GrIcons,
  Gi: GiIcons,
  Go: GoIcons,
  Fc: FcIcons,
  Cg: CgIcons,
  Bs: BsIcons,
  Vsc: VscIcons,
  Tfi: TfiIcons,
  Sl: SlIcons,
  Si: SiIcons,
  Ri: RiIcons,
  Lia: LiaIcons,
  Pi: PiIcons,
  Io5: Io5Icons,
  Io: IoIcons,
  Hi2: Hi2Icons,
  Hi: HiIcons,
  Im: ImIcons,
};


// Default fallback icon
// const DefaultIcon = MdIcons.MdHelpOutline;
const DefaultIcon = MdIcons.MdOutlineMenu;

const DynamicIcon = ({
  name,
  className,
  size = 20,
  color,
}: {
  name?: string | null;
  className?: string;
  size?: number | string;
  color?: string;
}) => {
  if (!name || typeof name !== "string" || name.length < 2) {
    return <DefaultIcon className={className || "text-gray-600"} size={size} color={color} />;
  }

  const prefix = name.slice(0, 2);
  const library = iconLibraries[prefix];

  let Icon = library ? library[name] : null;

  // Handle overlapping libraries (Io vs Io5, Hi vs Hi2)
  if (!Icon) {
    if (prefix === "Io") {
      Icon = Io5Icons[name as keyof typeof Io5Icons];
    } else if (prefix === "Hi") {
      Icon = Hi2Icons[name as keyof typeof Hi2Icons];
    }
  }

  const RenderIcon = Icon || DefaultIcon;

  return <RenderIcon className={className || "text-current"} size={size} color={color} />;
};

export default DynamicIcon;
