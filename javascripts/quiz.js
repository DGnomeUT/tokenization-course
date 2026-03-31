/* quiz.js v2 */
console.log('[quiz.js] loaded');

function initPage() {
  console.log('[quiz.js] initPage called');
  styleRefresher();
  initQuiz();
}

function styleRefresher() {
  var h2 = document.getElementById('executive-refresher');
  if (!h2) return;
  var wrapper = document.createElement('div');
  wrapper.className = 'refresher-wrapper';
  h2.parentNode.insertBefore(wrapper, h2);
  wrapper.appendChild(h2);
  var next = wrapper.nextElementSibling;
  while (next) {
    var toMove = next;
    next = next.nextElementSibling;
    if (toMove.tagName === 'H2') break;
    if (toMove.tagName === 'HR') { wrapper.appendChild(toMove); break; }
    wrapper.appendChild(toMove);
  }
}

function initQuiz() {
  var h2 = document.getElementById('knowledge-check-quiz');
  if (!h2) { console.log('[quiz.js] no quiz h2 found'); return; }
  console.log('[quiz.js] found quiz section');

  // Collect all elements after h2 until next h2
  var elements = [];
  var el = h2.nextElementSibling;
  while (el && el.tagName !== 'H2') {
    elements.push(el);
    el = el.nextElementSibling;
  }

  // Wrap h2 + elements in .quiz-wrapper
  var wrapper = document.createElement('div');
  wrapper.className = 'quiz-wrapper';
  h2.parentNode.insertBefore(wrapper, h2);
  wrapper.appendChild(h2);
  elements.forEach(function(e) { wrapper.appendChild(e); });

  // Parse answers from answer key section
  var answers = {};
  var answerH3 = wrapper.querySelector('h3[id*="answer-key"]');
  if (answerH3) {
    var akEl = answerH3.nextElementSibling;
    while (akEl) {
      var m = akEl.textContent.match(/^\s*(\d+)\.\s*Answer:\s*([A-D])/i);
      if (m) answers[m[1]] = m[2].toUpperCase();
      akEl = akEl.nextElementSibling;
    }
    console.log('[quiz.js] parsed answers:', answers);

    // Collect answer key elements into a collapsible wrapper
    var akEls = [];
    akEl = answerH3.nextElementSibling;
    while (akEl) { akEls.push(akEl); akEl = akEl.nextElementSibling; }

    var akWrapper = document.createElement('div');
    akWrapper.className = 'quiz-answer-key';
    akWrapper.style.display = 'none';
    answerH3.after(akWrapper);
    akEls.forEach(function(e) { akWrapper.appendChild(e); });

    var btn = document.createElement('button');
    btn.className = 'quiz-toggle-btn';
    btn.textContent = 'Show Answer Key';
    answerH3.before(btn);
    btn.addEventListener('click', function() {
      var hidden = akWrapper.style.display === 'none';
      akWrapper.style.display = hidden ? 'block' : 'none';
      btn.textContent = hidden ? 'Hide Answer Key' : 'Show Answer Key';
    });
  }

  // Tag questions and make options clickable
  var questionNum = 0;
  var allP = wrapper.querySelectorAll('p');
  allP.forEach(function(p) {
    var text = p.textContent.trim();
    var strong = p.querySelector('strong');

    // Question: has a <strong> starting with a number
    if (strong && /^\d+\./.test(strong.textContent.trim())) {
      questionNum++;
      p.classList.add('quiz-question');
      p.setAttribute('data-question', String(questionNum));
      return;
    }

    // Option: starts with A), B), C) or D)
    if (/^[A-D]\)/.test(text) && questionNum > 0) {
      p.classList.add('quiz-option');
      p.setAttribute('data-question', String(questionNum));
      p.setAttribute('data-option', text[0].toUpperCase());
      p.addEventListener('click', function() {
        var qNum = this.getAttribute('data-question');
        var chosen = this.getAttribute('data-option');
        var correct = answers[qNum];

        wrapper.querySelectorAll('.quiz-option[data-question="' + qNum + '"]').forEach(function(o) {
          o.classList.remove('quiz-selected', 'quiz-correct', 'quiz-incorrect', 'quiz-reveal');
        });

        this.classList.add('quiz-selected');
        if (chosen === correct) {
          this.classList.add('quiz-correct');
        } else {
          this.classList.add('quiz-incorrect');
          var correctEl = wrapper.querySelector('.quiz-option[data-question="' + qNum + '"][data-option="' + correct + '"]');
          if (correctEl) correctEl.classList.add('quiz-reveal');
        }
      });
    }
  });

  console.log('[quiz.js] tagged ' + questionNum + ' questions');
}

// Run on load (handles both normal and deferred loading)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
