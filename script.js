// اختيار الرائحة، حركة الشعار، وظهور الأقسام عند التمرير
const scents= {
  deep:['الأخشاب والعنبر','جرّب نفحات العود وخشب الصندل والعنبر. طابع دافئ يناسب الأمسيات والأوقات التي تحب فيها حضوراً مميزاً.'],fresh:['الحمضيات والنفحات المنعشة','جرّب البرغموت والليمون والنفحات المائية. خيارات منعشة تناسب الاستخدام اليومي والأجواء الدافئة.'],soft:['الزهور والمسك','جرّب الورد والياسمين والمسك. روائح ناعمة وأنيقة تناسب من يحب عطراً رقيقاً ومتوازناً.']
}
;
document.querySelectorAll('[data-scent]').forEach(button=>button.addEventListener('click',()=> {
  document.querySelectorAll('[data-scent]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const [title,copy]=scents[button.dataset.scent];
  document.getElementById('result-title').textContent=title;
  document.getElementById('result-copy').textContent=copy;
}
));
document.getElementById('year').textContent=new Date().getFullYear();
const stage=document.querySelector('.brand-stage');
stage.addEventListener('pointermove',e=> {
  if(e.pointerType==='touch')return;
  const r=stage.getBoundingClientRect();
  stage.style.setProperty('--tilt-y',((e.clientX-r.left)/r.width-.5)*28+'deg');
  stage.style.setProperty('--tilt-x',-((e.clientY-r.top)/r.height-.5)*20+'deg');
}
);
stage.addEventListener('pointerleave',()=> {
  stage.style.setProperty('--tilt-y','0deg');
  stage.style.setProperty('--tilt-x','0deg');
}
);
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=> {
    if(entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target)
    }
  }
  ), {
    threshold:.1
  }
  );
  document.querySelectorAll('.section-head,.collection,.story>div,.finder>div,.contact>h2').forEach(el=> {
    el.classList.add('scroll-reveal');
    observer.observe(el)
  }
  );
}
