export const shortenText = (name:string,length:number) =>
  name.length > length ? `${name.slice(0, length)}...` : name;
