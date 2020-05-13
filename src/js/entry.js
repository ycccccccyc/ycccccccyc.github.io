$(function(){

    // const contained = document.querySelector("#contained");;
    // let fileReader = new FileReader();

    //svg
    const svg = d3.select('svg');
    const margin = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    const width = svg.attr('width') - margin.left - margin.right;
    const height = svg.attr('height') - margin.top - margin.bottom;
    const centerX = width/2; const centerY = height/2;

    //数据提取所需要的所有数据
    let smoke = [];
    let fat = [];
    let sport = [];
    let hypertension = [];
    let hyperglycemia = [];
    let countriesEn = [];

    let smoke_m = [], smoke_f = [], fat_m = [],fat_f = [],sport_m = [], sport_f = [],
        hypertension_m = [], hypertension_f = [], hyperglycemia_m = [], hyperglycemia_f=[];
    // let countriesZh;
    let continent = [];
    let area = [];
    let deathNum = [];
    let gdp = [];
    let population = [];
    let deathRate = [];
    let anchorAngle = []
    

    d3.csv("datall.csv",function(error,csvdata){
        if(error){
            console.log('load csv error');
        }
        $.each(csvdata, function(index, ele){
            continent.push(ele['continent']);
            countriesEn.push(ele['country']);
            area.push(ele['area'])
            smoke.push(ele['smoke']);
            fat.push(ele['fat']);
            sport.push(ele['sport']);
            hypertension.push(ele['hypertension']);
            hyperglycemia.push(ele['hyperglycemia']);
            gdp.push(ele['gdp']);
            population.push(ele['population']);
            deathRate.push(ele['deathRate'])
            smoke_m.push(ele['smoke_m'])
            smoke_f.push(ele['smoke_f'])
            fat_m.push(ele['fat_m'])
            fat_f.push(ele['fat_f'])
            sport_m.push(ele['sport_m'])
            sport_f.push(ele['sport_f'])
            hypertension_m.push(ele['hypertension_m'])
            hypertension_f.push(ele['hypertension_f'])
            hyperglycemia_m.push(ele['hyperglycemia_m'])
            hyperglycemia_f.push(ele['hyperglycemia_f'])
        })

        //数据清洗
        preprocess(smoke);
        preprocess(fat);
        preprocess(sport);
        preprocess(hypertension);
        preprocess(hyperglycemia);
        //绘制图形
        setup();
    });



    let container = null;
    let growingTree = null;
    let factorChart = null;
    let radius = [];
    let interval = null;

    let currentCountryIndex = 0;
    let timer = null;
    let highlight = false;//控制单次高亮
    let highlightIndex = null;

    let recCol = ['rgb(221,186,186)','rgb(219,169,169)','rgb(214,149,148)']
    let recColorScale=[]
    let deathRateMax;//min=0.354

    //对无效数据做必要的剔除
    function preprocess(arr) {
        for(var i in arr){
            arr[i] = parseFloat(arr[i]);
            if(Number.isNaN(arr[i]) || arr[i] === "")arr[i] = 0;
        }
    }


    function setup() {
        //坐标
        container = svg.append("g")
            .attr('class', 'map')
            .attr("transform","translate("+width/2 +"," +height/2 +")")
            .on('mouseenter', triggerSelect)
        growingTree = svg.append("g")
            .attr('class', 'tree')
            
        allPaint();
    }

    function allPaint() {
        deathRateMax = d3.max(deathRate)
        recColorScale = [(deathRateMax - (deathRateMax-0.354)/3), (deathRateMax - (deathRateMax-0.354)/3*2)];//inormal
        interval = 360/smoke.length;

        const allDeath = container.append('g')
            .attr('class','allDeath')
            .classed('rectGroup', true)
            .selectAll('polygon').data(deathRate).enter()
            .append("polygon")
            .attr('points', function(d, i){
                    return '200,2.5 '+ (200 + Math.pow(1.5, d*10) * 5)+','+3.2
                        + ' '+ (200 + Math.pow(1.5, d*10) *5)+','+'-3.2 ' + '200,-2.5'
                }
            )
            .attr('transform',function (d, i) {
                return "rotate("+ i*interval + ")";
            })
            .style('fill', function(d,i){
                if (d > recColorScale[0]) return recCol[2];
                else if(d > recColorScale[1])return recCol[1];
                else return recCol[0]
            })

        let countryScale = [42,47,54,16,23,12];

        let pie = d3.pie()
            .startAngle(Math.PI/2-0.02)
            .endAngle(Math.PI*4)
            .padAngle(0.02)
            .sort(null)
            .sortValues(null)
        let innerR = 184
        let outR = 190
        let arc_generator = d3.arc()
            .innerRadius(innerR)
            .outerRadius(outR)
            // .cornerRadius(10)
        let pieData = pie(countryScale)
        
        let g = container.append('g')
            .attr('class', 'scaleCircle')
            .selectAll("g")
            .data(pieData)
            .enter()
            .append("g")
        g.append("path")
            .attr('stroke', 'none')
            .attr("d", d => arc_generator(d))
            .attr("fill", 'rgb(221,123,123)')

    }

    function triggerSelect(){
        clearInterval(timer);
        let svgLeft = document.querySelector('#mysvg').getBoundingClientRect().left
        let svgTop = document.querySelector('#mysvg').getBoundingClientRect().top
        d3.select('.map').on('mousemove', function(Event){
            let index = -1;
            let deltx = event.clientX - svgLeft - width/2;
            let delty = event.clientY - svgTop - height/2;
            let angle = Math.atan(delty / deltx) * 180 / Math.PI;
            angle = (function(){
                if (deltx < 0)return 180 + angle;
                else if(delty > 0)return angle;
                else return 360 + angle;
            })(angle)
            let ind = Math.round(angle/interval)
            if(angle > ind*interval-1 && angle < ind*interval+1){
                index = ind;
                if(highlight == false){
                    pop(index);
                    highlight = true;
                    highlightIndex = index;
                    
                }
            }else{
                if(highlight){
                    highlight = false;
                    console.log(highlightIndex)
                    popback(highlightIndex);
                }
            }
        }).on('mouseleave',function(){
            if(highlight){
                highlight = false;
                popback(highlightIndex);
                scrollAuto();
            }
        })

    }

    function pop(index ,callback){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);
        paintTree(index);
        updateTable(index);
        
        currentRect.transition()
            .duration(500)
            .style('fill', 'rgb(221,110,110)')


        if(callback && callback == true){
            setTimeout(() => {
                popback(index)
            }, 2500);

        }
    }

    function paintTree(index){
        
        growingTree.attr("transform",
            "translate("+width/2+"," +height/2 +")"
            +" rotate(" + index * interval + ")"
            )


        const pieCol = ['rgb(140,179,221)', 'rgb(232,170,170)']
        
        let startX = (200 + Math.pow(1.5, deathRate[index]*10) * 5),
            startY = 0;

        //高血糖：中间
        if(hyperglycemia[index] != 0){
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2',startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x1', startX)
                .attr('x2', startX + hyperglycemia[index]*4)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [hyperglycemia_m[index], hyperglycemia_f[index]];
            let pie = d3.pie()
            let innerR = 0
            let outR = Math.log(hyperglycemia[index])*3
            let arc_generator = d3.arc()
                .innerRadius(innerR)
                .outerRadius(outR)
            let pieData = pie(dataset)
         
            let g = growingTree.append('g')
                .attr('transform', 
                'translate(' + (startX + hyperglycemia[index]*4)
                + ',0)')
                .attr('class', 'arcs')
                .selectAll("g")
                .data(pieData)
                .enter()
                .append("g")
            g.append("path")
                .style('opactiy', 0)
                .transition()
                .delay(700)
                .attr('stroke', 'none')
                .attr("d", d => arc_generator(d))
                .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX+ 8.5*4)
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }

        var path = d3.path();

        //高血压：第1条
        startY = -2;
        if(hypertension[index] != 0){
            endX = startX + hypertension[index]*4*Math.cos(-40/180 * Math.PI);
            endY = hypertension[index]*4*Math.sin(-40/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1',startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [hypertension_m[index], hypertension_f[index]];
            let pie = d3.pie()
            let innerR = 0
            let outR = Math.log(hypertension[index])*3
            let arc_generator = d3.arc()
                .innerRadius(innerR)
                .outerRadius(outR)
            let pieData = pie(dataset)
            
            let g = growingTree.append('g')
                .attr('transform', 
                'translate(' + endX + ","  + endY + ')')
                .attr('class', 'arcs')
                .selectAll("g")
                .data(pieData)
                .enter()
                .append("g")
            g.append("path")
                .style('opactiy', 0)
                .transition()
                .delay(700)
                .attr('stroke', 'none')
                .attr("d", d => arc_generator(d))
                .attr("fill", function(d,i){return pieCol[i]})
        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .transition()
                .duration(1000)
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX + 22.3*4*Math.cos(-40/180 * Math.PI))
                .attr('y2', 22.3*4*Math.sin(-40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //烟草:第2条
        startY = -1;
        if(smoke[index] != 0){
            endX = startX + smoke[index]*3.8*Math.cos(-20/180 * Math.PI);
            endY = smoke[index]*3.8*Math.sin(-20/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [smoke_m[index], smoke_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(smoke[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + ","  + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 19.2*4*Math.cos(-20/180 * Math.PI))
                .attr('y2',19.2*4*Math.sin(-20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //运动:第4条
        startY = 1;
        if(sport[index] != 0){
            endX = startX + sport[index]*3.8*Math.cos(20/180 * Math.PI);
            endY = sport[index]*3.8*Math.sin(20/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [sport_m[index], sport_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(sport[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + "," + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 27.5*4*Math.cos(20/180 * Math.PI))
                .attr('y2',27.5*4*Math.sin(20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //肥胖:第5条
        startY = 2;
        if(fat[index] != 0){
            endX = startX + fat[index]*3.8*Math.cos(40/180 * Math.PI);
            endY = fat[index]*3.8*Math.sin(40/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [fat_m[index], fat_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(fat[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + ","  + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 13.2*3.8*Math.cos(40/180 * Math.PI))
                .attr('y2',13.2*3.8*Math.sin(40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }

    }

    function popback(index){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);

        d3.selectAll('.triggeredTree')
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove()
        d3.selectAll('.arcs')
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove()


        currentRect.transition()
            .duration(500)
            .style('fill', function(){
                // console.log(deathRate[index])
                if (deathRate[index] > recColorScale[0]) return recCol[2];
                else if(deathRate[index] > recColorScale[1])return recCol[1];
                else return recCol[0]
            })

    }



    function scrollAuto(){
        clearInterval(timer);
        timer = setInterval(function(){
            pop(currentCountryIndex, true);

            if(currentCountryIndex>=193)currentCountryIndex=0;
            else currentCountryIndex += 1;
        },3000)

    }

    function updateTable(index){
        //资料卡更新
        $('.page5 .tableBox .data-countryCh').animate({opacity: 0}, 500, function(){
            $(this).text(countriesZh[index]).animate({opacity: 1},500)
        })
        $('.page5 .tableBox .data-countryEn').animate({opacity: 0}, 500, function(){
            $(this).text(countriesEn[index]).animate({opacity: 1},500)
        })

        //数字刷新
        digitalChange(index);

    }

    function digitalChange(index){
        var Event = {
            number: function(digit){
              var num_arr=[];
              for(var i = 0;i<digit.length;i++){
                num_arr.push(digit.charAt(i));
              }
         
              return num_arr;
            },
            dom: function(arr){
              var str = '';
              for(var i = 0;i<arr.length;i++){
                if(parseInt(arr[i])>=0){
                  str += '<div class="l js-l-box digit-container" data-show='+arr[i]+'>\
                          <span>0</span>\
                          <span>1</span>\
                          <span>2</span>\
                          <span>3</span>\
                          <span>4</span>\
                          <span>5</span>\
                          <span>6</span>\
                          <span>7</span>\
                          <span>8</span>\
                          <span>9</span>\
                        </div>';
                }else{
                   str += '<div class="sign-box l"><span>'+arr[i]+'</span></div>';
                }
              }
              return str;
            },
            animation: function(){
                var height = $(".js-box").height();
                
                $(".js-l-box").each(function(i){
                    var num = parseInt($(this).data("show"));
                    var scrollTop = 0;
                    var scrollTop = height * num;
                    $(this).css("margin-top",0);
                    $(this).animate({marginTop: -scrollTop},1500);
                });
            }
        };

        let final_arr = Event.number(area[index]);
        $(".data-area").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-area").eq(1).html(Event.dom(final_arr));
        Event.animation();
        final_arr = Event.number(population[index]);
        $(".data-population").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-population").eq(1).html(Event.dom(final_arr));
        Event.animation();
        let curRate = (Math.round(deathRate[index]*10000)/100).toString();
        final_arr = Event.number(curRate);
        $(".data-deathRate").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-deathRate").eq(1).html(Event.dom(final_arr));
        Event.animation();
    }



    $('.wrapper').fullpage({
        licenseKey: ' i have no key ',
        anchors: ['page1', 'page2', 'page3', 'page4','page5'],
        // sectionsColor: ['rgb(218,198,198)', '#330505', '#330505', '#330505'],
        afterLoad: function(anchor, index){
            if(index.index == 4){
                scrollAuto();
            }
        },
        onLeave: function(index, nextIndex){
        }
    });
});