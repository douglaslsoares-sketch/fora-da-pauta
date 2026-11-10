import { ImageResponse } from "next/og";
export const runtime = "edge";
export async function GET() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#000000",padding:"55px"}}>
      <svg width="260" height="165" viewBox="0 0 620 374" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFD700" fillRule="evenodd" d="M345,125 326,120 291,121 304,128 306,131 294,143 287,153 308,168 319,169 326,172 329,175 332,182 334,193 333,204 326,220 317,230 302,239 291,242 276,242 258,236 242,222 237,214 233,202 233,188 195,179 192,193 192,209 195,224 205,246 218,262 236,276 252,284 281,291 303,291 323,287 337,282 359,269 370,259 382,243 391,222 394,207 393,184 389,170 377,149 363,135ZM598,198 578,175 545,143 518,121 483,98 449,81 424,72 391,64 362,60 365,58 387,53 418,49 453,49 471,51 495,56 521,65 498,49 480,40 452,30 409,22 369,21 333,25 294,34 246,52 208,71 159,101 117,131 61,176 28,205 22,212 28,216 140,154 206,122 256,105 279,100 303,97 341,97 359,99 391,106 417,115 454,133 487,154 519,179 539,198 522,216 495,239 471,257 434,280 398,297 372,306 343,313 310,317 275,316 251,312 225,305 202,296 174,282 138,259 99,230 45,228 81,263 121,295 149,313 182,330 208,340 235,347 275,352 305,352 346,347 376,340 419,325 457,307 494,285 534,256 572,224Z"/>
      </svg>
      <div style={{display:"flex",flexDirection:"column",marginLeft:"20px",justifyContent:"center"}}>
        <div style={{color:"#FFFFFF",fontSize:65,fontWeight:800}}>FIQUE DE OLHO</div>
        <div style={{color:"#FFD700",fontSize:29,fontWeight:700,marginTop:"20px"}}>Decisões que afetam a sua vida.</div>
      </div>
    </div>, {width:1200,height:630,headers:{"Cache-Control":"public, max-age=3600"}}
  );
}
