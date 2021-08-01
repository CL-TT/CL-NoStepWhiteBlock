/*
 * @Author: CL
 * @Date: 2021-01-26 19:23:49
 * @LastEditTime: 2021-01-27 16:34:40
 * @Description: 别踩白块小游戏
 * 
 * 思路与注意的点{
 *   1. getElementByClassName和getElementByTagsName返回的都是一个数组
 * 
 *   2. 什么时候开始运动是个问题?
 *      2.1 一开始是没有divRow的，所以divMain的top值先加了5，符合判断条件所以会先创建一行
 *      2.2 马上让divMain的top值变成-175，又执行render方法
 *      2.3 这时候不满足判断条件， top值一直在减，所以在做下落运动
 * 
 *   3. 判断游戏的输赢?
 *      3.1 如果点到白块，那么就输了，游戏结束
 *      3.2 如果让黑块溜走，那么同样输了，游戏结束
 *      3.3 如果想增加点游戏难度，可以让分数在达到一定程度的时候， 让下落速度加快
 *      3.4 会判断最后一个方块已经完成下落你还没点到黑的方块，你就会输了，一个完整的判断会有
 *          6行方块
 * 
 *   4. 怎么样把超过的方块移除掉?
 *      4.1 如果6个方块中的最后一行方块都没有黑方块，那么就用removeChild移除最后一个元素
 * 
 *   5. 需要优化的点?
 *      5.1 黑块的颜色是可以改变的，可以变成彩块
 *      5.2 整体的游戏界面可以变得更加炫酷
 *      5.3 游戏素材可以更加规范化
 * }
 */

(function(){
  const game = {
    init: function(){
      this.rowNum = 4;   //每一行做多能容纳的块数

      this.speedY = 3;   //初始化下落的初始速度

      this.score = 0;    //游戏分数

      this.isStopGame = false;   //是否暂停游戏

      this.initDom();

      this.handle();
    },

    /**
     * 初始化Dom
     */
    initDom: function(){
      this.divStart = document.getElementsByClassName('play-game')[0];

      this.divWrap = document.getElementsByClassName('wrap')[0];

      this.btnStop = document.getElementsByClassName('stop-game')[0];

      this.divScore = document.getElementsByClassName('score')[0];

      this.divMain = document.createElement('div');
      this.divMain.setAttribute('class', 'main');
      this.divWrap.appendChild(this.divMain);
    },

    /**
     * 处理事件监听的方法
     */
    handle: function(){
      const self = this;
      //开始游戏按钮的事件监听
      this.divStart.onclick = function(){
        //把开始游戏按钮隐藏, 并开始渲染游戏素材, 这里面的this不是指向game对象，而是指向this.divStart
        this.style.display = 'none';

        self.divMain.style.display = 'block';

        //开始绘制素材
        self.move();
      };

      //暂停游戏的按钮的事件监听
      this.btnStop.onclick = function(){
        if(!self.isStopGame){
          //如果游戏是运行的, 点击过后就要暂停游戏
          clearInterval(self.timer);

          self.isStopGame = true;
          this.innerHTML = '继续游戏';
        }else{
          //如果游戏是暂停的, 点击过后就要开始游戏
          self.move();

          self.isStopGame = false;
          this.innerHTML = '暂停游戏';
        }
      };

      //利用事件委托来处理需要给多个div绑定事件，事件委托是基于事件冒泡的原理
      this.divMain.addEventListener('click', function(e){
        if(e.target.classList.contains('black')){
          //如果点击到的方块是黑方块，那么就加分数，并且移除class black，并且改变背景颜色
          self.score++;
          //让加的分数渲染到页面上
          self.divScore.innerHTML = `分数：${self.score}`;

          if(self.score % 12 == 0){
            //如果分数是12的倍数，那么就加快下落的速度
            self.speedY += self.getRanNum(0.5, 1.5);
          }

          e.target.classList.remove('black');
          e.target.style.backgroundColor = 'grey';
        }else{
          //如果点击到的是白方块，那么游戏结束
          self.gameOver('很遗憾, 您踩到白块了哦!');
        }
      }, false);
    },

    /**
     * 元素缓慢的向下移动
     */
    move: function(){
      clearInterval(this.timer);
      
      this.timer = setInterval(() => {
        this.render();
      }, 16)
    },

    /**
     * 渲染Dom的方法
     */
    render: function(){
      if(!this.judgeLose()){
        this.gameOver('很遗憾, 您输了, 再来一局吧!');
        return;
      };

      this.divMain.style.top = this.divMain.offsetTop + this.speedY + 'px';

      if(this.divMain.offsetTop >= 0){
        //开始创建每一行的方块
        this.renderRow();

        //再让maindiv的top值变成-175
        this.divMain.style.top = '-175px';
      }
    },

    /**
     * 判断下落时出现输的情况
     */
    judgeLose(){
      const length = this.divMain.childNodes.length;

      if(length == 6){
        //最后一行的方块还有黑方块那么就输了
        const lastChild = this.divMain.childNodes[length - 1];

        for(let i = 0; i < lastChild.childNodes.length; i++){
          if(lastChild.childNodes[i].classList.contains('black')){
            return false;
          }
        }

        //需要移除最后一个元素
        this.divMain.removeChild(lastChild);
      }

      return true;
    },

    /**
     * 游戏结束
     */
    gameOver: function(text){
      clearInterval(this.timer);

      setTimeout(() => {
        alert(text);

        //重新初始化游戏
        location.reload();
      }, 0)
    },

    /**
     * 专门绘制每一行的Dom
     */
    renderRow: function(){
      const divRow = document.createElement('div');

      divRow.setAttribute('class', 'row');

      const ranNum = this.getRanNum(0, 4);

      for(let i = 0; i < this.rowNum; i++){
        const divCol = document.createElement('div');

        divCol.setAttribute('class', 'col');

        if(ranNum == i){
          divCol.classList.add('black');
        }

        divRow.appendChild(divCol);
      }

      if(this.divMain.childNodes.length == 0){
        //还没有子元素的时候，就直接加入到main中
        this.divMain.appendChild(divRow);
      }else{
        //就加入到第一个元素的前面
        this.divMain.insertBefore(divRow, this.divMain.firstChild);
      }
    },

    /**
     * 返回一个范围随机数, 向下取整取不到最大数
     */
    getRanNum: function(min, max){
      return Math.floor((Math.random() * (max - min)) + min);
    }
  };

  game.init();
})()
