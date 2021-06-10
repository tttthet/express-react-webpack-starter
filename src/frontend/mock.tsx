import { Directory, TYPES } from './';

//export const buildMock(initValue: number): Directory[] | null {
export function buildMock(initValue: number): Directory[] | null {
  let k = 0;

  function lots(begin: number) {
    const items = []

    for (let i = 0; i <= 299; i++) {
      items.push({
	id: begin + i,
	name: 'file' + begin + i,
	_type: TYPES.FILE,
	lastModified: getRandomDate()
      });
    }

    return items;
  }

  return (function build(i: number): Directory[] | null {
    if (!i) return null;

    return [...Array(i).keys()].reverse().map(j => {
      k++;

      if (j % 2) {
	return {
	  id: k,
	  name: 'file' + k,
	  _type: TYPES.FILE,
	  lastModified: getRandomDate()
	}
      } else {
	return {
	  id: k,
	  name: 'dir' + k,
	  _type: TYPES.DIR,
	  children: i-- === initValue ? lots(k) : build(i),
	  isOpen: false
	}
      }
    });
  })(initValue);
}

const getRandomDate = (): Date => new Date(Date.now() - Math.ceil(Math.random() * 100000000000));
