const RTL_LANGS = ['ar', 'he', 'fa', 'ur'];

document.addEventListener('DOMContentLoaded', () => {
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const translationText = document.getElementById('translationText');

  sourceLang.addEventListener('change', updateInputDirection);
  targetLang.addEventListener('change', updateOutputDirection);
  translationText.addEventListener('input', updateInputDirection);
});

function updateInputDirection() {
  const lang = document.getElementById('sourceLang').value;
  const el = document.getElementById('translationText');
  el.style.direction = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  el.style.textAlign = RTL_LANGS.includes(lang) ? 'right' : 'left';
}

function updateOutputDirection() {
  const lang = document.getElementById('targetLang').value;
  const el = document.getElementById('translationResult');
  el.style.direction = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  el.style.textAlign = RTL_LANGS.includes(lang) ? 'right' : 'left';
}

async function translateText() {
  const text = document.getElementById('translationText').value.trim();
  const source = document.getElementById('sourceLang').value;
  const target = document.getElementById('targetLang').value;
  const btn = document.getElementById('translateButton');
  const resultDiv = document.getElementById('translationResult');
  const actions = document.getElementById('resultActions');

  if (!text) {
    showAlert('يرجى كتابة نص للترجمة أولاً', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> جاري الترجمة...';

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`);
    const data = await res.json();

    if (data.responseStatus === 200) {
      resultDiv.innerHTML = data.responseData.translatedText;
      updateOutputDirection();
      actions.style.display = 'flex';
      showAlert('تمت الترجمة بنجاح!', 'success');
    } else {
      throw new Error();
    }
  } catch (e) {
    showAlert('حدث خطأ في الترجمة، يرجى المحاولة لاحقاً', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> ترجمة النص';
  }
}

function copyToClipboard() {
  const text = document.getElementById('translationResult').innerText;
  navigator.clipboard.writeText(text).then(() => showAlert('تم نسخ النص إلى الحافظة', 'success'));
}

function downloadTranslation() {
  const text = document.getElementById('translationResult').innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translation.txt';
  a.click();
  showAlert('بدأ تحميل ملف الترجمة', 'success');
}

function clearFields() {
  document.getElementById('translationText').value = '';
  document.getElementById('translationResult').innerHTML = '<div class="empty-state"><i class="fas fa-ghost"></i><p>بانتظار إدخال النص للترجمة...</p></div>';
  document.getElementById('resultActions').style.display = 'none';
  updateInputDirection();
}

function showAlert(msg, type) {
  const container = document.getElementById('alertContainer');
  const div = document.createElement('div');
  div.className = `alert alert-${type} alert-dismissible fade show`;
  const icons = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
  div.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg} <button class="close" data-dismiss="alert">&times;</button>`;
  container.innerHTML = '';
  container.appendChild(div);
  setTimeout(() => { if (div.parentElement) div.remove(); }, 4000);
}
