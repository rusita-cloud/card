document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const businessCard = document.getElementById('businessCard');
  const cardWrapper = document.querySelector('.card-wrapper');
  const flipToBackBtn = document.getElementById('flipToBackBtn');
  const flipToFrontBtn = document.getElementById('flipToFrontBtn');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const shareBtn = document.getElementById('shareBtn');

  let toastTimeout = null;

  /* ==========================================================================
     1. Toast Notification Helper
     ========================================================================== */
  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastMsg.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  /* ==========================================================================
     2. Flip Card Functionality
     ========================================================================== */
  let isFlipped = false;

  function toggleFlip(e) {
    if (e) e.stopPropagation();
    isFlipped = !isFlipped;
    if (isFlipped) {
      businessCard.classList.add('flipped');
    } else {
      businessCard.classList.remove('flipped');
    }
    // 카드 뒤집힐 때는 3D tilt 리셋
    resetTilt();
  }

  flipToBackBtn.addEventListener('click', toggleFlip);
  flipToFrontBtn.addEventListener('click', toggleFlip);

  /* ==========================================================================
     3. Copy to Clipboard
     ========================================================================== */
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        // 아이콘 피드백
        const icon = btn.querySelector('i');
        const prevClass = icon.className;
        icon.className = 'fa-solid fa-check text-success';
        
        showToast(`${textToCopy} 복사되었습니다!`);

        setTimeout(() => {
          icon.className = prevClass;
        }, 1500);
      }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        showToast('복사에 실패했습니다.');
      });
    });
  });

  /* ==========================================================================
     4. 3D Tilt Effect on Mouse Move
     ========================================================================== */
  function handleMouseMove(e) {
    // 뒤집힌 상태이거나 모바일 터치 디바이스일 경우 틸트 제외
    if (isFlipped || window.innerWidth < 768) return;

    const rect = cardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // max ±10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    businessCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  function resetTilt() {
    if (isFlipped) {
      businessCard.style.transform = 'rotateY(180deg)';
    } else {
      businessCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  }

  cardWrapper.addEventListener('mousemove', handleMouseMove);
  cardWrapper.addEventListener('mouseleave', resetTilt);

  /* ==========================================================================
     5. Save Contact (vCard .vcf Download)
     ========================================================================== */
  saveContactBtn.addEventListener('click', () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:김;민준;;;',
      'FN:김민준',
      'TITLE:바이브코딩 풀스택 개발자',
      'TEL;TYPE=CELL:010-3412-6530',
      'EMAIL;TYPE=INTERNET:kimmj@gmail.com',
      'NOTE:바이브코딩 풀스택 개발자 웹 명함',
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.href = url;
    downloadLink.setAttribute('download', '김민준_연락처.vcf');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    showToast('연락처 파일(vCard)이 다운로드되었습니다.');
  });

  /* ==========================================================================
     6. Share Business Card
     ========================================================================== */
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: '김민준 | 바이브코딩 풀스택 개발자 웹 명함',
      text: '김민준 개발자의 웹 명함입니다. (이메일: kimmj@gmail.com / 연락처: 010-3412-6530)',
      url: window.location.href
    };

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyShareFallback();
        }
      }
    } else {
      copyShareFallback();
    }
  });

  function copyShareFallback() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('명함 링크가 복사되었습니다!');
    }).catch(() => {
      showToast('링크 복사에 실패했습니다.');
    });
  }
});

