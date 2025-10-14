import React from "react";
import Hero from "../components/section/Hero";
import ExpandingMenu from "../components/section/ExpandingMenu";

const ForYouPage = () => {
  return (
    <div>
      <Hero />
      <div className="py-16 flex justify-center">
        <ExpandingMenu />
      </div>
    </div>
  );
};

export default ForYouPage;
