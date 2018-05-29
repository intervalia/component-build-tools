const FILLER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890 .-_!@#$%^&*=+';
const FILLER_MAX = FILLER.length;
const MIXED_LANGS = [
  '鼻毛', '指先', '眉毛', 'ひれ', 'ヘビ', 'カブ', '子供', '日本', '言語', '馬鹿', // Japanese Chars
  '영어', '소금', '트럭', '히피', '포크', '토성', '아픈', '오리', '얼음', '극지', // Korean Chars
  '孩子', '嬉皮', '雲彩', '占星', '胡說', '膀胱', '沙拉', '蠢貨', '烘烤', '蝸牛', // Chinese Chars
  'да', 'ща', 'по', 'не', 'из', 'за', 'Ий', 'дя', 'ИФ', 'ья', // Russian Chars
  'Ãé', 'Ûç', 'Çó', 'Ñá', 'Ýň', 'Èç', 'Ìë', 'Îú', 'Öà', 'Ūê' // Latin Chars
];
const REPLACEMENT_MAP = {
  A: 'ÀÁÂÃÄÅĀĄĂѦ', B: 'ƁɃḂ', C: 'ÇĆČĈĊ', D: 'ĎĐ', E: 'ÈÉÊËĒĘĚĔĖ', F: 'ƑḞ', G: 'ĜĞĠĢ',
  H: 'ĤĦ', I: 'ÌÍÎÏĪĨĬĮİ', J: 'ĴɈ', K: 'ĶҞҠ', L: 'ŁĽĹĻĿ', M: 'ṀƜӍ', N: 'ÑŃŇŅŊПИ',
  O: 'ÒÓÔÕÖØŌŐŎ', P: 'ƤṖ', R: 'ŔŘŖЯ', S: 'ŚŠŞŜȘ', T: 'ŤŢŦȚ', U: 'ÙÚÛÜŪŮŰŬŨŲЦ', V: 'ѴѶ',
  W: 'ŴШЩѠ', X: 'ЖҲӾ', Y: 'ÝŶŸ', Z: 'ŹŽŻ',
  a: 'àáâãäåāąă', b: 'БЪЬѢ', c: 'çćčĉċ', d: 'ďđ', e: 'èéêëēęěĕė', f: 'ƒḟ', g: 'ĝğġģ',
  h: 'ĥħ', i: 'ìíîïīĩĭįı', j: 'ĵǰɉ', k: 'ķĸƙǩ', l: 'łľĺļŀ', m: 'ṁӎ', n: 'ñńňņŉŋ',
  o: 'òóôõöøōőŏФ', r: 'ŕřŗя', s: 'śšşŝș', t: 'ťţŧț', u: 'ùúûüūůűŭũų', v: 'ѵѷ',
  w: 'ŵѡ', x: 'ӿӽж', y: 'ýÿŷЧѰ', z: 'žżź'
};

/*
 * creates pseudo locale object from one english locale object
 */
function createEOTranslations(engProps) {
  return Object.keys(engProps).reduce(
    (obj, key) => {
      obj[key] = makeEOProp(key, engProps[key]);
      return obj;
    }, {}
  );
}

/*
 * converts characters, adds length, and adds CKJ characters for a single string in a locale
 */
function makeEOProp(key, enStr) {
  const keyHashCode = getKeyHash(key);
  let newValue = convertString(keyHashCode, enStr);
  let suffix = MIXED_LANGS[keyHashCode % MIXED_LANGS.length];
  let length = newValue.length;
  let combinedLength = length + suffix.length;

  if (length > 0 && length <= 5) {
    length = 9;
  }
  else if (length >= 6 && length <= 25) {
    length *= 1.9;
  }
  else if (length >= 26 && length <= 40) {
    length *= 1.6;
  }
  else if (length >= 41 && length <= 70) {
    length *= 1.3;
  }

  let expansion = createFiller(Math.round(length - combinedLength));

  return '[' + newValue + expansion + suffix + ']';
}

/*
 * performs the character replacement for pseudo locale creation
 */
function convertString(keyHashCode, str) {
  let i;
  let isInTag = false;
  let isInVar = false;
  let strLength = str.length;
  let ret = '';

  for (i = 0; i < strLength; i++) {
    let current = str[i];

    if (isInTag) {
      ret += current;
      isInTag = current !== '>';
      continue;
    }
    else if (isInVar) {
      ret += current;
      isInVar = current !== '}';
      continue;
    }
    else if (current === '<') {
      // ignore HTML tags (but not content inside opening and closing tags,
      // e.g. for <p>Something</p> ignores <p> and </p> but not "Something")
      ret += current;
      isInTag = true;
      continue;
    }
    else if ((current === '$' && str[i + 1] === '{') ||
             (current === '%' && str[i + 1] === '{')) {
      // ignore replacement variables, e.g. ${myVar} and %{myVar}
      ret += current;
      isInVar = true;
      continue;
    }

    var replacements = REPLACEMENT_MAP[current] || [current];
    ret += replacements[keyHashCode % replacements.length];
  }

  return ret;
}

/*
 * Create a hash based on the string's KEY
 *
 * str = string to use for the hash
 */
function getKeyHash(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

/*
 * Create filler to bring the EO strings up to a percentage longer
 *
 * count = number of characters to include
 */
function createFiller(count) {
  var fill = '';

  // istanbul ignore else
  if (count > 0) {
    fill = '-';
    for (let i = 1; i < count; i++) {
      fill += FILLER[Math.round(Math.random() * FILLER_MAX)];
    }
  }

  return fill + '-:';
}

module.exports = createEOTranslations;
