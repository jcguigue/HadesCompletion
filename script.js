$(document).ready(function() {
    fetch('data.xlsx').then(response => response.arrayBuffer()).then(data => {
        const workbook = XLSX.read(data, {type: 'array'});
        processWorkbook(workbook);
        initializeCheckboxes(); // Initialize checkboxes after processing workbook
        updateAllSectionsCompletion(); // Update section percentages
        updateTotalCompletion(); // Calculate initial total completion percentage
    }).catch(error => {
        console.error('Error fetching the Excel file:', error);
    });
});

function processWorkbook(workbook) {
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
    generateChecklist(rows);
}

function generateChecklist(rows) {
    const container = $('#checklist-container');
    container.empty();
    let sectionCount = 0;
    let totalSections = 0;

    while (rows[0][sectionCount * 2] !== undefined) {
        totalSections++;
        sectionCount++;
    }

    sectionCount = 0;

    while (rows[0][sectionCount * 2] !== undefined) {
        const sectionTitle = rows[0][sectionCount * 2];
        const sectionContent = $('<div class="content"></div>');
        const section = $('<button class="collapsible"></button>').text(`${sectionTitle} (0%)`);
        section.on('click', function() {
            $(this).next('.content').toggle();
        });

        const items = {};
        for (let i = 1; i < rows.length; i++) {
            const item = rows[i][sectionCount * 2];
            const numOfCheckboxes = rows[i][sectionCount * 2 + 1];
            if (!item) break;
            if (!items[item]) {
                items[item] = numOfCheckboxes;
            } else {
                items[item] += numOfCheckboxes;
            }
        }

        const itemContainer = $('<div></div>');
        Object.keys(items).forEach((item, index) => {
            const numOfCheckboxes = items[item];
            const itemDiv = $('<div class="item"></div>');
            const itemLabel = $(`<label>${item}</label>`);
            const checkboxContainer = $('<div class="checkbox-container"></div>');

            for (let j = 1; j <= numOfCheckboxes; j++) {
                const checkbox = $(`<input type="checkbox" class="checkbox-${sectionCount}-${index}-${j}" data-section="${sectionCount}" data-item="${index}" data-num="${j}">`);
                checkbox.on('change', updateCompletion);
                checkboxContainer.append(checkbox);
            }

            itemDiv.append(itemLabel).append(checkboxContainer);
            itemContainer.append(itemDiv);
        });

        sectionContent.append(itemContainer);
        const sectionPercentage = (100 / Object.keys(items).length).toFixed(2);
        section.attr('data-percentage', sectionPercentage);
        section.attr('data-section', sectionCount);
        container.append(section);
        container.append(sectionContent);

        sectionCount++;
    }
}

function updateCompletion() {
    const sectionIndex = $(this).data('section');
    const itemIndex = $(this).data('item');
    const checkboxNum = $(this).data('num');

    if ($(this).is(':checked')) {
        for (let i = 1; i <= checkboxNum; i++) {
            $(`.checkbox-${sectionIndex}-${itemIndex}-${i}`).prop('checked', true);
            // Save checkbox state to local storage
            localStorage.setItem(`checkbox-${sectionIndex}-${itemIndex}-${i}`, 'checked');
        }
    } else {
        for (let i = checkboxNum; i <= $(`input[data-section="${sectionIndex}"][data-item="${itemIndex}"]`).length; i++) {
            $(`.checkbox-${sectionIndex}-${itemIndex}-${i}`).prop('checked', false);
            // Remove checkbox state from local storage
            localStorage.removeItem(`checkbox-${sectionIndex}-${itemIndex}-${i}`);
        }
    }

    updateSectionCompletion(sectionIndex);
    updateTotalCompletion();
}

function updateSectionCompletion(sectionIndex) {
    const sectionButton = $(`button[data-section="${sectionIndex}"]`);
    const checkboxes = $(`input[data-section="${sectionIndex}"]`);
    const checkedCheckboxes = checkboxes.filter(':checked').length;
    const totalCheckboxes = checkboxes.length;
    const sectionCompletion = ((checkedCheckboxes / totalCheckboxes) * 100).toFixed(2);
    var lastIndex = sectionButton.text().lastIndexOf(' ');
    const sectionTitle = sectionButton.text().substr(0, lastIndex);
    sectionButton.text(`${sectionTitle} (${sectionCompletion}%)`);
}

function updateTotalCompletion() {
    let totalCompletion = 0;
    const sections = $('button.collapsible');
    const totalSections = sections.length;

    sections.each(function() {
        const sectionCompletion = parseFloat($(this).text().match(/\(([^)]+)%\)/)[1]);
        totalCompletion += sectionCompletion / totalSections;
    });

    $('#total-completion').text(`Total Completion: ${totalCompletion.toFixed(2)}%`);
}

// Function to initialize checkboxes from local storage
function initializeCheckboxes() {
    $('input[type="checkbox"]').each(function() {
        const sectionIndex = $(this).data('section');
        const itemIndex = $(this).data('item');
        const checkboxNum = $(this).data('num');

        if (localStorage.getItem(`checkbox-${sectionIndex}-${itemIndex}-${checkboxNum}`) === 'checked') {
            $(this).prop('checked', true);
        } else {
            $(this).prop('checked', false);
        }
    });
}

// Function to update all sections' completion percentages
function updateAllSectionsCompletion() {
    $('button.collapsible').each(function() {
        const sectionIndex = $(this).data('section');
        updateSectionCompletion(sectionIndex);
    });
}
