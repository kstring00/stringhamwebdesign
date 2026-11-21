import { tilePath, type TileCell } from "./shape";
import s from "./tiles.module.css";

/**
 * One tile's shape, filling its parent. Drawn twice when a scene lays out
 * differently on a phone (`narrow`): only one of the two is shown. The
 * parent keeps the cell's proportions, so the shape scales evenly.
 */
export default function Tile({ wide, narrow, shadow = false }: { wide: TileCell; narrow?: TileCell; shadow?: boolean }) {
  const draw = (c: TileCell, cls: string) => {
    const d = tilePath(c);
    return (
      <svg className={`${s.shape} ${cls}`} viewBox={`0 0 ${c.w} ${c.h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {shadow ? <path className={s.shadow} d={d} data-tile-shadow /> : null}
        <path className={s.fill} d={d} />
      </svg>
    );
  };
  return (
    <>
      {draw(wide, narrow ? s.wideOnly : "")}
      {narrow ? draw(narrow, s.narrowOnly) : null}
    </>
  );
}
