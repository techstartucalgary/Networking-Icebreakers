import { useState } from "react";
import { QRCodeSVG } from 'qrcode.react';

function QRCodeDisplay() {
  return (
    <>
      <div className="bg-amber-200">
              <QRCodeSVG
                  value={"ABCD1234"}
                  title={"ABCD1234"}
                  size={128}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  imageSettings={{
                      src: "https://static.zpao.com/favicon.png",
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      opacity: 1,
                      excavate: true,
                  }}
              />
      </div>
    </>
  );
}

export default QRCodeDisplay;
