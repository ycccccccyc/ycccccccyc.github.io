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

    let recCol = ['rgb(85,9,9)','rgb(95,12,12)','rgb(107,13,13)','rgb(122,16,16)','rgb(137,19,19)']

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
        interval = 360/smoke.length;
        rectWidth = 5;

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
            // .style('fill' ,'rgb(180,160,160)')
            .style('fill', function(d,i){
                if(continent[i]%2 == 1)return 'rgb(180,160,160)'
                else return 'rgb(214,199,199)'
            })

    }

    function triggerSelect(){
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
                    popback(highlightIndex);
                }
            }
        }).on('mouseleave',function(){
            if(highlight){
                highlight = false;
                popback(highlightIndex);
            }
        })

    }

    function pop(index){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);

        growingTree.attr("transform",
            "translate("+width/2+"," +height/2 +")"
            +" rotate(" + index * interval + ")"
            )


        const pieCol = ['rgb(171,100,100)', 'rgb(220,180,180)']
        
        let startX = (200 + Math.pow(1.5, deathRate[index]*10) * 5),
            startY = 0;
        //贝赛尔曲线尝试
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
                .style('stroke','rgb(211,79,79)')
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

            // growingTree.append('circle')
            //     .attr('class','triggeredTree')
            //     .attr('cx',startX + hyperglycemia[index]*2 + 10*hypertension_m[index])
            //     .attr('cy',-10*hyperglycemia_m[index])
            //     .attr('r',10*hyperglycemia_m[index])
            //     .style('fill', 'rgb(111,94,234)')
            // growingTree.append('circle')
            //     .attr('class','triggeredTree')
            //     .attr('cx',startX + hyperglycemia[index]*2 +1)
            //     .attr('cy',3)
            //     .attr('r',10*(1-hyperglycemia_f[index]))
            //     .style('fill', 'rgb(255,159,237)')
        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX+18)
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(137,19,19)')
                .attr('stroke-dasharray', '5 5')
        }

        var path = d3.path();

        //高血压：第1条
        startY = -2;
        if(hypertension[index] != 0){
            endX = startX + hypertension[index]*4*Math.cos(-40/180 * Math.PI);
            endY = hypertension[index]*4*Math.sin(-40/180 * Math.PI);
            // let cpx1 = startX + (endX - startX)/3, 
            //     cpy1 = -2;
            // let cpx2 = startX + (endX - startX)/3*2, 
            //     cpy2 = -4;
            // path.moveTo(startX,startY);
            // path.bezierCurveTo(cpx1,cpy1,cpx2,cpy2,endX,endY);
            // growingTree.append('path')
            //     .attr('class','triggeredTree')
            //     .attr('d',path.toString())
            //     .style('stroke','rgb(211,79,79)')
            //     .style('stroke-width','2')
            //     .style('fill', 'none')

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
                .style('stroke','rgb(211,79,79)')
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

            // growingTree.append('circle')
            //     .attr('class','triggeredTree')
            //     .attr('cx',endX+3)
            //     .attr('cy',endY-2)
            //     .attr('r',7*hypertension_m[index])
            //     .style('fill', 'rgb(111,94,234)')
            // growingTree.append('circle')
            //     .attr('class','triggeredTree')
            //     .attr('cx',endX+3)
            //     .attr('cy',endY+4)
            //     .attr('r',7*(1-hypertension_m[index]))
            //     .style('fill', 'rgb(255,159,237)')


        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .transition()
                .duration(1000)
                .attr('x1', startX)
                .attr('y1', startY)
                // .attr('x2',startX+18.3)
                // .attr('y2',startY-9.15)
                .attr('x2', startX+46*Math.cos(-40/180 * Math.PI))
                .attr('y2', startY+46*Math.cos(-40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(211,79,79)')
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
                .style('stroke','rgb(211,79,79)')
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
                .attr('x2',startX+34*Math.cos(-20/180 * Math.PI))
                .attr('y2',startY+34*Math.sin(-20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(211,79,79)')
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
                .style('stroke','rgb(211,79,79)')
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
                .attr('x2',startX+56*Math.cos(20/180 * Math.PI))
                .attr('y2',startY+56*Math.sin(20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(211,79,79)')
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
                .style('stroke','rgb(211,79,79)')
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
                .attr('x2',startX+40*Math.cos(40/180 * Math.PI))
                .attr('y2',startY+40*Math.sin(40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(211,79,79)')
                .attr('stroke-dasharray', '5 5')
        }

        
        currentRect.transition()
            .duration(150)
            .style('fill', 'rgb(211,79,79)')
    }

    function popback(index){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);

        d3.selectAll('.triggeredTree')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .remove()
        d3.selectAll('.arcs')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .remove()


        currentRect.transition()
            .duration(100)
            .style('fill', 'rgb(180,160,160)')

    }







    $('.wrapper').fullpage({
        licenseKey: ' i have no key ',
        anchors: ['page1', 'page2', 'page3', 'page4','page5'],
        // sectionsColor: ['rgb(218,198,198)', '#330505', '#330505', '#330505'],
        afterLoad: function(anchor, index){
            if(index.index == 4){
                // w = $(window).width();
                // h = $(window).height();
                // al
            }
        },
        onLeave: function(index, nextIndex){
        }
    });
});