document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル変数・定数 (変更なし) ---
    const playerEntriesContainer = document.getElementById('playerEntries');
    const addPlayerButton = document.getElementById('addPlayerButton');
    const generateTeamsButton = document.getElementById('generateTeamsButton');
    const attackerPlayersUl = document.getElementById('attackerPlayers');
    const defenderPlayersUl = document.getElementById('defenderPlayers');
    const attackerRankSumSpan = document.getElementById('attackerRankSum');
    const defenderRankSumSpan = document.getElementById('defenderRankSum');
    const mapNameP = document.getElementById('mapName');
    const mapImageImg = document.getElementById('mapImage');
    const copyResultButton = document.getElementById('copyResultButton');
    const resultTextTextarea = document.getElementById('resultText');

    // 設定モーダル関連 (変更なし)
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsButton = document.getElementById('openSettingsButton');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const rankSettingsContainer = document.getElementById('rankSettingsContainer');
    const addRankButton = document.getElementById('addRankButton');
    const saveRankSettingsButton = document.getElementById('saveRankSettingsButton');
    const mapSelectionContainer = document.getElementById('mapSelectionContainer');
    const saveMapSettingsButton = document.getElementById('saveMapSettingsButton');
    const resetTeamsButton = document.getElementById('resetTeamsButton');
    const resetAllDataButton = document.getElementById('resetAllDataButton');


    let players = []; // 変更なし
    let rankTiers = [ // 変更なし (内容はそのまま)
        { name: 'A+', value: 5 },
        { name: 'A', value: 4 },
        { name: 'B+', value: 3 },
        { name: 'B', value: 2 },
        { name: 'C', value: 1 }
    ];

    let allMaps = [ // 変更なし (内容はそのまま)
        { name: 'バインド', file: 'Loading_Screen_Bind.webp', selected: true },
        { name: 'ヘイブン', file: 'Loading_Screen_Haven.webp', selected: true },
        { name: 'スプリット', file: 'Loading_Screen_Split.webp', selected: true },
        { name: 'アセント', file: 'Loading_Screen_Ascent.webp', selected: true },
        { name: 'アイスボックス', file: 'Loading_Screen_Icebox.webp', selected: true },
        { name: 'ブリーズ', file: 'Loading_Screen_Breeze.webp', selected: true },
        { name: 'フラクチャー', file: 'Loading_Screen_Fracture.webp', selected: true },
        { name: 'パール', file: 'Loading_Screen_Pearl.webp', selected: true },
        { name: 'ロータス', file: 'Loading_Screen_Lotus.webp', selected: true },
        { name: 'サンセット', file: 'Loading_Screen_Sunset.webp', selected: true },
        { name: 'アビス', file: 'Loading_Screen_Abyss.webp', selected: true },
        { name: 'カロード', file: 'Loading_Screen_Corrode.webp', selected: true } // 元のコードにあったので残します
    ];
    let selectedMap = null; // 変更なし

    // --- 初期化処理 (変更なし) ---
    loadData(); // ローカルストレージからデータを読み込む
    renderPlayerInputs();
    renderRankSettings();
    renderMapSelection();
    addInitialPlayerEntries(); // 初期プレイヤー入力欄を数個表示

    // --- イベントリスナー ---

    // [変更] 人数制限を撤廃
    addPlayerButton.addEventListener('click', () => {
        // デフォルトは最低ランク、参加チェックあり
        addPlayerEntry("", rankTiers[rankTiers.length - 1].name, true); 
        savePlayers();
    });

    generateTeamsButton.addEventListener('click', generateTeamsAndMap); // 変更なし

    openSettingsButton.addEventListener('click', () => { // 変更なし
        settingsModal.style.display = 'block';
    });

    closeSettingsButton.addEventListener('click', () => { // 変更なし
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => { // 変更なし
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    addRankButton.addEventListener('click', addNewRankSettingInput); // 変更なし
    saveRankSettingsButton.addEventListener('click', saveRankSettings); // 変更なし
    saveMapSettingsButton.addEventListener('click', saveMapSettings); // 変更なし
    resetTeamsButton.addEventListener('click', resetTeamDisplay); // 変更なし

    copyResultButton.addEventListener('click', copyResultToClipboard); // 変更なし
    resetAllDataButton.addEventListener('click', resetAllApplicationData); // 変更なし


    // --- 関数定義 ---

    // [変更] addPlayerEntry に selected 引数を追加
    function addInitialPlayerEntries() {
        const existingPlayers = players.length;
        if (existingPlayers === 0) { // 既存のプレイヤーデータがない場合のみ初期入力欄を追加
            for (let i = 0; i < 5; i++) { // 初期は5人分の入力欄を用意
                addPlayerEntry("", rankTiers[rankTiers.length -1].name, true); // デフォルトは最低ランク、参加チェックあり
            }
        }
    }

    // [変更] チェックボックスを追加、selected 引数を追加
    function addPlayerEntry(name = "", rankName = rankTiers[0].name, selected = true, id = Date.now() + Math.random()) {
        const playerEntryDiv = document.createElement('div');
        playerEntryDiv.classList.add('player-entry');
        playerEntryDiv.dataset.id = id;

        // [追加] 参加選択用チェックボックス
        const participationCheckbox = document.createElement('input');
        participationCheckbox.type = 'checkbox';
        participationCheckbox.checked = selected;
        participationCheckbox.classList.add('participation-checkbox');
        participationCheckbox.title = "チーム分けに参加させる場合はチェック";
        participationCheckbox.addEventListener('change', savePlayers); // チェック変更時も保存

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'プレイヤー名';
        nameInput.value = name;
        nameInput.addEventListener('change', savePlayers);

        const rankSelect = document.createElement('select');
        rankTiers.forEach(tier => {
            const option = document.createElement('option');
            option.value = tier.name;
            option.textContent = `${tier.name} (${tier.value})`;
            if (tier.name === rankName) {
                option.selected = true;
            }
            rankSelect.appendChild(option);
        });
        rankSelect.addEventListener('change', savePlayers);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.classList.add('delete-player-button');
        deleteButton.addEventListener('click', () => {
            playerEntriesContainer.removeChild(playerEntryDiv);
            savePlayers(); // 削除後も保存
        });

        playerEntryDiv.appendChild(participationCheckbox); // [追加] チェックボックスを先頭に追加
        playerEntryDiv.appendChild(nameInput);
        playerEntryDiv.appendChild(rankSelect);
        playerEntryDiv.appendChild(deleteButton);
        playerEntriesContainer.appendChild(playerEntryDiv);
    }

    // [変更] selected (チェックボックスの状態) も収集するように変更
    function collectPlayersData() {
        const collectedPlayers = []; // グローバル変数 `players` を直接操作しない
        const entries = playerEntriesContainer.querySelectorAll('.player-entry');
        entries.forEach(entry => {
            const name = entry.querySelector('input[type="text"]').value.trim();
            const rankName = entry.querySelector('select').value;
            const rankValue = rankTiers.find(r => r.name === rankName)?.value || 0;
            const selected = entry.querySelector('.participation-checkbox').checked; // チェックボックスの状態を取得
            
            collectedPlayers.push({
                id: entry.dataset.id, 
                name: name,
                rankName: rankName,
                rankValue: rankValue,
                selected: selected // selected プロパティを追加
            });
        });
        return collectedPlayers; // 収集したデータを返す
    }

    // [変更] チーム分けの対象を「選択されたプレイヤー」のみにする
    function generateTeamsAndMap() {
        savePlayers(); // チーム分け実行前に、現在の入力内容（チェック状態含む）を `players` 配列に反映
        
        // [変更] 参加者リストを作成 (チェックあり かつ 名前が入力されている)
        const participants = players.filter(p => p.selected && p.name.trim() !== '');

        if (participants.length === 0) {
            alert('チーム分けに参加するプレイヤー（チェックボックスがオンで名前が入力されている）が1人もいません。');
            return;
        }
        // [変更] Valorantのカスタム上限である10人チェックは、参加者に対して行う
        if (participants.length > 10) {
            alert('チーム分けに参加するプレイヤーは最大10人までです。現在 ' + participants.length + ' 人選択されています。');
            return;
        }
        if (participants.length < 2) { // 1人ではチーム分けできない
             alert('チーム分けに参加するプレイヤーは最低2人必要です。現在 ' + participants.length + ' 人選択されています。');
            return;
        }

        // [変更] チーム分けロジック (対象を `players` から `participants` に変更)
        let shuffledPlayers = [...participants].sort(() => 0.5 - Math.random()); // プレイヤーをシャッフル
        let teamAttacker = [];
        let teamDefender = [];
        let rankSumAttacker = 0;
        let rankSumDefender = 0;

        let bestAttackerTeam = [];
        let bestDefenderTeam = [];
        let minDiff = Infinity;

        // 1000回試行
        for (let i = 0; i < 1000; i++) {
            let currentShuffledPlayers = [...participants].sort(() => 0.5 - Math.random()); // [変更] 対象は participants
            let currentAttacker = [];
            let currentDefender = [];
            let currentRankSumAttacker = 0;
            let currentRankSumDefender = 0;

            currentShuffledPlayers.forEach((player, index) => {
                // 人数が少ないチーム、またはランク合計が低いチームに優先的に追加
                if (currentAttacker.length < Math.ceil(currentShuffledPlayers.length / 2) &&
                    (currentAttacker.length <= currentDefender.length || currentRankSumAttacker <= currentRankSumDefender)) {
                    if (currentAttacker.length < 5) { // チーム上限5人
                        currentAttacker.push(player);
                        currentRankSumAttacker += player.rankValue;
                    } else if (currentDefender.length < 5) {
                        currentDefender.push(player);
                        currentRankSumDefender += player.rankValue;
                    }
                } else if (currentDefender.length < 5) { // チーム上限5人
                    currentDefender.push(player);
                    currentRankSumDefender += player.rankValue;
                } else if (currentAttacker.length < 5) { // 参加者が10人で、先にDが5人埋まった場合
                    currentAttacker.push(player);
                    currentRankSumAttacker += player.rankValue;
                }
            });

            // 9人以下で片方のチームが5人を超えないように調整
            if (currentShuffledPlayers.length <= 9) {
                while (currentAttacker.length > 5 || (currentAttacker.length > currentDefender.length + 1 && currentAttacker.length > Math.ceil(currentShuffledPlayers.length / 2))) {
                    if (currentDefender.length < 5) {
                        currentDefender.push(currentAttacker.pop());
                    } else break; 
                }
                while (currentDefender.length > 5 || (currentDefender.length > currentAttacker.length + 1 && currentDefender.length > Math.ceil(currentShuffledPlayers.length / 2))) {
                     if (currentAttacker.length < 5) {
                        currentAttacker.push(currentDefender.pop());
                    } else break;
                }
            }


            // 合計値の差を計算
            const diff = Math.abs(currentRankSumAttacker - currentRankSumDefender);

            // 参加者が1人の場合 (アラートで弾かれるが、念のため)
            if (currentShuffledPlayers.length === 1) {
                 bestAttackerTeam = currentAttacker; 
                 bestDefenderTeam = currentDefender;
                 minDiff = 0; 
                 break; 
            }

            if (diff < minDiff) {
                minDiff = diff;
                bestAttackerTeam = currentAttacker;
                bestDefenderTeam = currentDefender;
            } else if (diff === minDiff) {
                const currentBalance = Math.abs(currentAttacker.length - currentDefender.length);
                const bestBalance = Math.abs(bestAttackerTeam.length - bestDefenderTeam.length);
                if (currentBalance < bestBalance) {
                    bestAttackerTeam = currentAttacker;
                    bestDefenderTeam = currentDefender;
                }
            }
        } // 試行ループ終了

        teamAttacker = bestAttackerTeam;
        teamDefender = bestDefenderTeam;
        rankSumAttacker = teamAttacker.reduce((sum, p) => sum + p.rankValue, 0);
        rankSumDefender = teamDefender.reduce((sum, p) => sum + p.rankValue, 0);


        // チーム表示更新
        displayTeam(teamAttacker, attackerPlayersUl);
        displayTeam(teamDefender, defenderPlayersUl);
        attackerRankSumSpan.textContent = rankSumAttacker;
        defenderRankSumSpan.textContent = rankSumDefender;

        // マップ選択
        selectRandomMap();
        saveLastTeamAndMap(teamAttacker, teamDefender, rankSumAttacker, rankSumDefender, selectedMap);
    }

    function displayTeam(team, ulElement) { // 変更なし
        ulElement.innerHTML = ''; // リストをクリア
        team.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name} (ランク: ${player.rankName})`;
            ulElement.appendChild(li);
        });
    }

    function selectRandomMap() { // 変更なし
        const availableMaps = allMaps.filter(map => map.selected);
        if (availableMaps.length > 0) {
            selectedMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];
            mapNameP.textContent = selectedMap.name;
            mapImageImg.src = `img/${selectedMap.file}`; // imgフォルダを指定
            mapImageImg.alt = selectedMap.name;
            mapImageImg.style.display = 'block';
        } else {
            mapNameP.textContent = '選択可能なマップがありません';
            mapImageImg.src = '';
            mapImageImg.style.display = 'none';
            selectedMap = null;
        }
    }

    // [変更] addPlayerEntry に selected プロパティを渡す
    function renderPlayerInputs() {
        playerEntriesContainer.innerHTML = ''; // 既存の入力欄をクリア
        players.forEach(player => {
            // 互換性のため、selected がない場合は true (参加) に設定
            const isSelected = player.selected !== undefined ? player.selected : true;
            addPlayerEntry(player.name, player.rankName, isSelected, player.id);
        });
        // プレイヤーデータがない場合、または少ない場合は初期入力欄を追加
        if (players.length < 5 && players.length === 0) { 
             addInitialPlayerEntries();
        } else if (players.length === 0) { 
            addInitialPlayerEntries();
        }
    }


    // --- 設定関連の関数 (変更なし) ---
    function renderRankSettings() {
        rankSettingsContainer.innerHTML = '';
        rankTiers.forEach((tier, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('rank-setting-item');

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = tier.name;
            nameInput.placeholder = 'ランク名 (例: A+)';
            itemDiv.appendChild(nameInput);

            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            valueInput.value = tier.value;
            valueInput.placeholder = '強さ';
            itemDiv.appendChild(valueInput);

            const deleteRankButton = document.createElement('button');
            deleteRankButton.textContent = '×';
            deleteRankButton.classList.add('delete-rank-button');
            deleteRankButton.addEventListener('click', () => {
                rankTiers.splice(index, 1);
                renderRankSettings(); // 再描画
            });
            itemDiv.appendChild(deleteRankButton);

            rankSettingsContainer.appendChild(itemDiv);
        });
        // 既存のプレイヤー入力欄のセレクトボックスも更新
        updateAllPlayerRankSelects();
    }

    function addNewRankSettingInput() {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('rank-setting-item');

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '新しいランク名';
        itemDiv.appendChild(nameInput);

        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.placeholder = '強さ';
        itemDiv.appendChild(valueInput);

        const tempDeleteButton = document.createElement('button'); // 一時的な削除ボタン
        tempDeleteButton.textContent = '×';
        tempDeleteButton.onclick = () => itemDiv.remove();
        itemDiv.appendChild(tempDeleteButton);

        rankSettingsContainer.appendChild(itemDiv);
    }


    function saveRankSettings() {
        const newRankTiers = [];
        const settingItems = rankSettingsContainer.querySelectorAll('.rank-setting-item');
        let valid = true;
        settingItems.forEach(item => {
            const name = item.querySelector('input[type="text"]').value.trim();
            const value = parseInt(item.querySelector('input[type="number"]').value);
            if (name && !isNaN(value)) {
                newRankTiers.push({ name, value });
            } else {
                valid = false;
            }
        });

        if (!valid || newRankTiers.length === 0) {
            alert('すべてのランク名と有効な数値を入力してください。');
            renderRankSettings(); 
            return;
        }

        rankTiers = newRankTiers;
        rankTiers.sort((a, b) => b.value - a.value); 
        renderRankSettings(); 
        updateAllPlayerRankSelects(); 
        localStorage.setItem('valorantRankTiers', JSON.stringify(rankTiers));
        alert('ランク設定を保存しました。');
    }

    function updateAllPlayerRankSelects() {
        const allSelects = playerEntriesContainer.querySelectorAll('select');
        allSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = ''; 
            rankTiers.forEach(tier => {
                const option = document.createElement('option');
                option.value = tier.name;
                option.textContent = `${tier.name} (${tier.value})`;
                select.appendChild(option);
            });
            if (rankTiers.some(t => t.name === currentValue)) {
                select.value = currentValue;
            } else if (rankTiers.length > 0) {
                select.value = rankTiers[0].name; 
            }
        });
        savePlayers(); 
    }


    function renderMapSelection() { // 変更なし
        mapSelectionContainer.innerHTML = '';
        allMaps.forEach((map, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('map-select-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `map_checkbox_${index}`;
            checkbox.checked = map.selected;
            checkbox.dataset.mapName = map.name;

            const label = document.createElement('label');
            label.htmlFor = `map_checkbox_${index}`;
            label.textContent = map.name;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            mapSelectionContainer.appendChild(itemDiv);
        });
    }

    function saveMapSettings() { // 変更なし
        const checkboxes = mapSelectionContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const mapName = checkbox.dataset.mapName;
            const mapObj = allMaps.find(m => m.name === mapName);
            if (mapObj) {
                mapObj.selected = checkbox.checked;
            }
        });
        localStorage.setItem('valorantMaps', JSON.stringify(allMaps));
        alert('マップ設定を保存しました。');
    }

    function resetTeamDisplay() { // 変更なし
        attackerPlayersUl.innerHTML = '';
        defenderPlayersUl.innerHTML = '';
        attackerRankSumSpan.textContent = '0';
        defenderRankSumSpan.textContent = '0';
        mapNameP.textContent = 'マップはまだ選択されていません';
        mapImageImg.src = '';
        mapImageImg.style.display = 'none';
        selectedMap = null;
        localStorage.removeItem('lastTeamData');
        alert('チーム表示とマップをリセットしました。');
    }

    // --- 結果出力 (変更なし) ---
    function copyResultToClipboard() {
        if (!selectedMap || attackerPlayersUl.children.length === 0 && defenderPlayersUl.children.length === 0) {
            alert('チーム分けとマップ選択を先に実行してください。');
            return;
        }

        const attackerNames = Array.from(attackerPlayersUl.children).map(li => li.textContent.split(' (ランク:')[0]);
        const defenderNames = Array.from(defenderPlayersUl.children).map(li => li.textContent.split(' (ランク:')[0]);

        const textToCopy = `マップ : ${selectedMap.name} | アタッカー : ${attackerNames.join(', ')} | ディフェンダー : ${defenderNames.join(', ')}`;
        resultTextTextarea.value = textToCopy;
        resultTextTextarea.select();
        try {
            document.execCommand('copy');
            alert('結果をクリップボードにコピーしました！');
        } catch (err) {
            alert('コピーに失敗しました。手動でコピーしてください。');
            console.error('Copy failed:', err);
        }
        resultTextTextarea.blur();
    }

    // --- ローカルストレージ関連 ---

    // [変更] collectPlayersData の戻り値を使うように変更
    function savePlayers() {
        players = collectPlayersData(); // 最新のプレイヤー情報を取得してグローバル変数 `players` を更新
        localStorage.setItem('valorantPlayers', JSON.stringify(players));
    }

    // [変更] 読み込み時に selected プロパティがない場合のデフォルト値を設定
    function loadPlayers() {
        const storedPlayers = localStorage.getItem('valorantPlayers');
        if (storedPlayers) {
            players = JSON.parse(storedPlayers).map(player => ({
                ...player,
                // 互換性のため、selected がない場合は true (参加) に設定
                selected: player.selected !== undefined ? player.selected : true 
            }));
        } else {
            players = []; // データがない場合は空配列
        }
    }

    function loadRankTiers() { // 変更なし
        const storedRankTiers = localStorage.getItem('valorantRankTiers');
        if (storedRankTiers) {
            rankTiers = JSON.parse(storedRankTiers);
        }
    }

    function loadMaps() { // 変更なし
        const storedMaps = localStorage.getItem('valorantMaps');
        if (storedMaps) {
            const loadedMaps = JSON.parse(storedMaps);
            allMaps = allMaps.map(defaultMap => {
                const loadedMap = loadedMaps.find(lm => lm.name === defaultMap.name);
                return loadedMap ? { ...defaultMap, selected: loadedMap.selected } : defaultMap;
            });
        }
    }

    function saveLastTeamAndMap(teamA, teamD, sumA, sumD, map) { // 変更なし
        const lastTeamData = {
            attackerTeam: teamA.map(p => ({name: p.name, rankName: p.rankName})),
            defenderTeam: teamD.map(p => ({name: p.name, rankName: p.rankName})),
            attackerRankSum: sumA,
            defenderRankSum: sumD,
            selectedMap: map
        };
        localStorage.setItem('lastTeamData', JSON.stringify(lastTeamData));
    }

    function loadLastTeamAndMap() { // 変更なし
        const lastData = localStorage.getItem('lastTeamData');
        if (lastData) {
            const data = JSON.parse(lastData);
            if (data.attackerTeam && data.defenderTeam && data.selectedMap) {
                displayTeam(data.attackerTeam, attackerPlayersUl);
                displayTeam(data.defenderTeam, defenderPlayersUl);
                attackerRankSumSpan.textContent = data.attackerRankSum;
                defenderRankSumSpan.textContent = data.defenderRankSum;
                selectedMap = data.selectedMap;
                mapNameP.textContent = selectedMap.name;
                mapImageImg.src = `img/${selectedMap.file}`;
                mapImageImg.alt = selectedMap.name;
                mapImageImg.style.display = 'block';
            }
        }
    }

    function loadData() { // 変更なし
        loadRankTiers();
        loadMaps();
        loadPlayers(); 
        renderPlayerInputs(); 
        updateAllPlayerRankSelects(); 
        loadLastTeamAndMap(); 
    }

    function resetAllApplicationData() { // 変更なし
        if (confirm("本当にすべてのプレイヤー情報、ランク設定、マップ設定をリセットしますか？この操作は元に戻せません。")) {
            localStorage.removeItem('valorantPlayers');
            localStorage.removeItem('valorantRankTiers');
            localStorage.removeItem('valorantMaps');
            localStorage.removeItem('lastTeamData');

            players = [];
            rankTiers = [
                { name: 'A+', value: 5 }, { name: 'A', value: 4 },
                { name: 'B+', value: 3 }, { name: 'B', value: 2 }, { name: 'C', value: 1 }
            ];
            allMaps.forEach(map => map.selected = true); 

            renderPlayerInputs(); 
            addInitialPlayerEntries(); 
            renderRankSettings();
            renderMapSelection();
            resetTeamDisplay();

            alert("すべてのデータがリセットされました。");
        }
    }
});
