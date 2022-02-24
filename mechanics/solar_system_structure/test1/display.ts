import P5 from 'p5'

export function setupP5() {
  let p5 = new P5(() => {})

  let canvas = document.getElementById('main_container') || ''

  p5.createCanvas(1000, 400).parent(canvas)
  
  p5.draw = () => {
    p5.background(220);

    p5.rect(10, 10, 20, 20)
  }
}
