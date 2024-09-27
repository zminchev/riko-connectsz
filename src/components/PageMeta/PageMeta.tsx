import Head from "next/head";
import React from "react";

const PageMeta = ({ title }: { title: string }) => {
  const pageTitle = title ? `${title}` : "Riko ConnectsZ";
  return (
    <Head>
      <title>{pageTitle}</title>
    </Head>
  );
};

export default PageMeta;
