
var m_tabs = [document.getElementById('m_tab1'), document.getElementById('m_tab2'), document.getElementById('m_tab4')];
var i_tabs = [document.getElementById('i_tab1'), document.getElementById('i_tab2'), document.getElementById('i_tab4')];

function mouseOver(elem) {
    
    elem.classList.add("hover");
  }

  function mouseOut(elem) {
    
	elem.classList.remove("hover");
  }



function set_active(elem) {
    const trigger = elem.closest(".tab_trigger");
    if (!trigger) return;

    const tabs = trigger.querySelectorAll(".tabl");

    tabs.forEach(tab => {
        tab.classList.remove("active");
        tab.classList.remove("hover");
    });

    elem.classList.add("active");
}