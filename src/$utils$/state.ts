export const coordinate: [number, number] = [0, 0];
export const lastElement: [HTMLElement | null] = [null];
export const saveCoordinate = (e)=>{
    coordinate[0] = e?.clientX ?? coordinate[0];
    coordinate[1] = e?.clientY ?? coordinate[1];
};
