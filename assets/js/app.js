// 引入jquery, 并把$变量挂载到全局
require('expose?$!jquery');

// 引入各个模块
import init from './init';
import resize from './resize';

// 构建游戏类
class Game {

	constructor(size) {
		this.size = size;
	}

}

// 给Game挂载方法
Object.assign(Game.prototype, {init, resize});

var cardGame = new Game(4);

cardGame.init();