const pkg = require('./package.json');
const validProperties = require('./valid-properties');

let ADD_WIDTH = false,
    ADD_HEIGHT = false;

/**
* format color from {r: 0, g: 0, b: 0} 
* to rgb(0, 0, 0)
*/
function formatColor(ocolor) {
  let result = 'rgb(';
  Object.keys(ocolor).forEach((key, i) => {
    if(i < 3) {
      result += `${ocolor[key] * 255}`;
      if(i < 2) 
        result += ',';
    }
  });
  result += ')';
  return result;
}


/**
 * parse options inside the name of the object 
 * ex: .button[W-H]; this would capture height and width
 * of the element
*/
function parseOptions(item) {
  if(item.name.match(/\[(.*?)\]/)) {
    let options = item.name.match(/\[(.*?)\]/)[1],
      obj = {};

    options.split('-').forEach((opts) => {
      obj[opts] = true; 
    }); 
    return obj;
  }
  return {};
}



/**
 * this function is used in all vector transformations
 */
function transformVector(css, item) {
  let opts = parseOptions(item); 
  css += `${item.name.split('[')[0]} {\n`;
  if(ADD_WIDTH || opts['W']) 
    css += `\twidth: ${item.absoluteBoundingBox.width}px !important;\n`;
  if(ADD_HEIGHT || opts['H'])
    css += `\theight: ${item.absoluteBoundingBox.height}px !important;\n`;
  if(item.fills.length) {
    css += `\tbackground-color: ${formatColor(item.fills[0].color)} !important;\n`;
  }
  if(item.strokes.length) {
    css += `\tborder: ${item.strokeWeight}px ${item.strokes[0].type} ${formatColor(item.strokes[0].color)} !important;\n`;
  }
  if(item.cornerRadius) {
    css += `\tborder-radius: ${item.cornerRadius}px !important;\n`;
  }
  css += '}\n\n';
  return css;
}

let styleTransformers = {
  'TEXT': function(css, item) {
    css += `${item.name} {\n`;
    Object.keys(item.style).forEach((key) => {
      if(validProperties[key]) {
        let prop = validProperties[key](item, 'prop'),
            value = validProperties[key](item, 'value');
        css += `\t${prop}: ${value} !important;\n`;
      }
    });
    css += `\tcolor: ${formatColor(item.fills[0].color)} !important;\n`
    css += '}\n\n';
    return css;
  },
  'VECTOR': function(css, item) {
    return transformVector(css, item); 
  },
  'RECTANGLE': function(css, item) {
    return transformVector(css, item); 
  }
}

let classesList = [];


/**
* append to css variable based 
* on the type of nome, creating the class 
* and styles
*/
function appendCSS(item, css) {
  if(item.type === 'TEXT' || item.type === 'VECTOR' || item.type === 'RECTANGLE') {
    if((item.name.match(/^\./) || item.name.match(/^\#/)) && 
      !classesList.find(elem => elem === item.name+item.type)){
      classesList.push(item.name+item.type);
      css = styleTransformers[item.type](css, item);
    }
  } else {
    if(item.children) {
      item.children.forEach((subitem) => {
        css = appendCSS(subitem, css); 
      });
    }
  }
  return css;
}



module.exports = (data) => {
  if(!data) {
    console.error('no data was passed to the transform function!');
    return;
  }
  let css = '',
    objectName = data['name'];
  if(data['children']) {
    data['children'].forEach((item) => {
      css = appendCSS(item, css);   
    });
  }else {
    css = appendCSS(data, css);
  }

  if(!css) {
    return;
  }
  
  return css;
} 
