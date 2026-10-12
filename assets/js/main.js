(function () {
  'use strict';

  // ---------- Home: search + category filter ----------
  var grid = document.getElementById('post-grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('#filters .chip'));
    var input = document.getElementById('search-input');
    var empty = document.getElementById('empty');
    var current = 'all';

    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var okCat = current === 'all' || card.getAttribute('data-category') === current;
        var okText = !q || card.getAttribute('data-title').toLowerCase().indexOf(q) !== -1;
        card.hidden = !(okCat && okText);
        if (!card.hidden) shown++;
      });
      empty.hidden = shown !== 0;
    };

    var select = function (filter) {
      current = filter;
      chips.forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-filter') === filter);
      });
      apply();
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.getAttribute('data-filter');
        select(filter);
        var url = filter === 'all' ? location.pathname : location.pathname + '?c=' + encodeURIComponent(filter);
        history.replaceState(null, '', url);
      });
    });
    input.addEventListener('input', apply);

    // Allow linking to a category: /?c=技术
    var match = location.search.match(/[?&]c=([^&]+)/);
    if (match) {
      var wanted = decodeURIComponent(match[1]);
      if (chips.some(function (c) { return c.getAttribute('data-filter') === wanted; })) {
        select(wanted);
        document.querySelector('.posts-section').scrollIntoView();
      }
    }
  }

  // ---------- 404: echo the missing path ----------
  var missing = document.querySelector('.not-found .t-path');
  if (missing) missing.textContent = decodeURIComponent(location.pathname);

  // ---------- Post page ----------
  var content = document.querySelector('.post-content');
  if (!content) return;

  // Open external links in a new tab
  Array.prototype.forEach.call(content.querySelectorAll('a[href]'), function (a) {
    if (a.hostname && a.hostname !== location.hostname) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });

  // Table of contents with scroll spy
  var tocList = document.getElementById('post-toc-list');
  var headings = Array.prototype.slice.call(content.querySelectorAll('h2, h3'));
  if (!headings.length) {
    document.querySelector('.post-toc').classList.add('is-empty');
  }
  var tocLinks = headings.map(function (h, i) {
    if (!h.id) h.id = 'section-' + (i + 1);
    var li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
    return a;
  });

  // Reading progress + active heading
  var bar = document.querySelector('.read-progress span');
  var ticking = false;
  var onScroll = function () {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(doc.scrollTop / max, 1) : 0) + ')';

    var active = -1;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top < 120) active = i;
      else break;
    }
    tocLinks.forEach(function (a, i) { a.classList.toggle('active', i === active); });
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Copy buttons on code blocks
  var copyText = function (text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  };

  Array.prototype.forEach.call(content.querySelectorAll('pre'), function (pre) {
    var host = pre.closest('.highlighter-rouge, figure.highlight') || pre;
    if (host.querySelector('.code-copy')) return;
    var wrapper = host;
    if (host === pre) {
      wrapper = document.createElement('div');
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }
    wrapper.classList.add('code-wrap');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'copy';
    btn.addEventListener('click', function () {
      copyText(pre.innerText, function () {
        btn.textContent = 'copied ✓';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1600);
      });
    });
    wrapper.appendChild(btn);
  });

  // Copy post link
  var copyLink = document.querySelector('.copy-link');
  if (copyLink) {
    copyLink.addEventListener('click', function () {
      copyText(copyLink.getAttribute('data-url'), function () {
        copyLink.textContent = '已复制 ✓';
        setTimeout(function () { copyLink.textContent = '复制链接'; }, 1600);
      });
    });
  }

  // Lazy-load Disqus when the comment area comes into view
  var thread = document.getElementById('disqus_thread');
  if (thread && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      window.disqus_shortname = thread.getAttribute('data-shortname');
      var s = document.createElement('script');
      s.src = 'https://' + window.disqus_shortname + '.disqus.com/embed.js';
      s.async = true;
      s.setAttribute('data-timestamp', +new Date());
      document.body.appendChild(s);
    }, { rootMargin: '200px' });
    io.observe(thread);
  }
})();
