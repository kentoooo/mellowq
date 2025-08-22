// 形容詞のリスト
const ADJECTIVES = [
  'ふわふわ',
  'もこもこ',
  'ふんわり',
  'ほわほわ',
  'そよそよ',
  'ぽかぽか',
  'ひんやり',
  'きらきら',
  'しとしと',
  'さらさら',
  'のんびり',
  'すやすや',
  'うとうと',
  'こつこつ',
  'きょとん',
  'にこにこ',
  'てれてれ',
  'ゆるゆる',
  'ほくほく',
  'とことこ',
  'ぽよぽよ',
  'ころころ',
  'ぱたぱた',
  'ぷかぷか',
  'ぽたぽた',
  'くるくる',
  'ちょこん'
];

// 動物のリスト（日本語名とファイル名のマッピング）
const ANIMALS = [
  { name: 'クマ', file: 'bear.png' },
  { name: 'ネコ', file: 'cat.png' },
  { name: 'イヌ', file: 'dog.png' },
  { name: 'ペンギン', file: 'penguin.png' },
  { name: 'キツネ', file: 'fox.png' },
  { name: 'コアラ', file: 'koala.png' },
  { name: 'トラ', file: 'tiger.png' },
  { name: 'ヒヨコ', file: 'chick.png' }
];

/**
 * 文字列から一貫性のあるハッシュ値を生成
 * @param str - 入力文字列
 * @returns ハッシュ値
 */
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * ユーザーIDから一貫性のあるアバター情報を生成
 * @param id - ユーザーID
 * @returns アバター情報（名前、アイコンパス）
 */
export function getAvatarInfo(id: string): {
  name: string;
  iconPath: string;
  adjective: string;
  animal: string;
} {
  const hash = getHash(id);
  
  // ハッシュ値を使って形容詞と動物を選択
  const adjectiveIndex = hash % ADJECTIVES.length;
  const animalIndex = (hash >> 8) % ANIMALS.length; // 異なるビットを使用して独立性を保つ
  
  const adjective = ADJECTIVES[adjectiveIndex];
  const animal = ANIMALS[animalIndex];
  
  return {
    name: `${adjective}${animal.name}`,
    iconPath: `/icons/${animal.file}`,
    adjective: adjective,
    animal: animal.name
  };
}

/**
 * ユーザーIDからアバターアイコンのパスを取得（後方互換性のため残す）
 * @param id - ユーザーID
 * @returns アイコンのパス
 */
export function getAvatarPath(id: string): string {
  return getAvatarInfo(id).iconPath;
}

/**
 * ユーザーIDからアバター名を取得
 * @param id - ユーザーID
 * @returns アバター名（形容詞+動物名）
 */
export function getAvatarName(id: string): string {
  return getAvatarInfo(id).name;
}