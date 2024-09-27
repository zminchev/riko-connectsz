import { useRouter } from "next/router";
import React from "react";
import Button from "src/components/Button";
import Card from "src/components/Card";

const SidebarHeaderOptions = [
  {
    id: 1,
    text: "Chats",
    href: "/chats",
  },
  {
    id: 2,
    text: "Groups",
    href: "/groups",
  },
  {
    id: 3,
    text: "Settings",
    href: "/settings",
  },
];

const SidebarHeader = ({ isOpen }: { isOpen: boolean }) => {
  const router = useRouter();

  const pathName = router.pathname;
  const isActive = (href: string) => {
    return href === pathName;
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 bg-white h-20 p-2 transform transition-transform duration-300 ease-in-out flex md:translate-x-0 md:static w-96 z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full pr-1"
      } `}
    >
      <Card className="flex py-4 justify-center items-center w-full">
        {SidebarHeaderOptions.map((option) => {
          return (
            <Button
              key={option.id}
              text={option.text}
              className={`py-2 px-8 text-sm border-t border-b last:border-r first:border-l border-cyan-600 first:rounded-tl first:rounded-bl last:rounded-tr last:rounded-br ${
                isActive(option.href) ? "text-white bg-cyan-600" : "bg-white text-cyan-600"
              }`}
              onClick={() => router.push(option.href)}
            />
          );
        })}
      </Card>
    </div>
  );
};

export default SidebarHeader;
