// VTK.js setup
const fullScreenRenderer = vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
    background: [1, 1, 1],
    rootContainer: document.getElementById('renderWindow'),
    containerStyle: { height: '100%', width: '100%' },
    container: document.getElementById('renderWindow')
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

let actor;
let cubeAxes;
let boundingBoxActor;

function toggleView() {
    const camera = renderer.getActiveCamera();
    const toggleButton = document.getElementById('toggleView');
    if (camera.getParallelProjection()) {
        camera.setParallelProjection(false);
        toggleButton.textContent = 'Perspective View';
        toggleButton.classList.remove('active');
    } else {
        camera.setParallelProjection(true);
        toggleButton.textContent = 'Parallel View';
        toggleButton.classList.add('active');
    }
    renderer.resetCamera();
    renderWindow.render();
}

document.getElementById('toggleView').addEventListener('click', toggleView);

function loadPLY(filePath, opacity, color) {
    const reader = vtk.IO.Geometry.vtkPLYReader.newInstance();
    return reader.setUrl(filePath).then(() => {
        const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
        mapper.setInputConnection(reader.getOutputPort());

        actor = vtk.Rendering.Core.vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().setOpacity(opacity);
        actor.getProperty().setColor(...color);

        renderer.addActor(actor);

        return actor;
    });
}

function loadFile1() {
    if (actor) {
        renderer.removeActor(actor);
    }
    loadPLY('./optic_nerve.ply', 1.0, [238.0/255.0, 212.0/255.0, 168.0/255.0]).then(() => {
        renderer.resetCamera();
        renderWindow.render();
    });
}

function loadFile2() {
    if (actor) {
        renderer.removeActor(actor);
    }
    loadPLY('./two_fasciculus.ply', 1.0, [238.0/255.0, 212.0/255.0, 168.0/255.0]).then(() => {
        renderer.resetCamera();
        renderWindow.render();
    });
}

document.getElementById('file1Button').addEventListener('click', loadFile1);
document.getElementById('file2Button').addEventListener('click', loadFile2);

document.getElementById('surfaceColor').addEventListener('input', (event) => {
    const color = hexToRgb(event.target.value);
    if (actor) {
        actor.getProperty().setColor(color.r / 255, color.g / 255, color.b / 255);
        renderWindow.render();
    }
});

document.getElementById('bgColor').addEventListener('input', (event) => {
    const color = hexToRgb(event.target.value);
    renderer.setBackground(color.r / 255, color.g / 255, color.b / 255);
    renderWindow.render();
});

document.getElementById('boundingBox').addEventListener('click', (event) => {
    const button = event.target;
    if (boundingBoxActor) {
        renderer.removeActor(boundingBoxActor);
        boundingBoxActor = null;
        button.classList.remove('active');
    } else {
        const bounds = actor.getBounds();
        const boxSource = vtk.Filters.Sources.vtkCubeSource.newInstance();
        boxSource.setBounds(bounds);

        const boxMapper = vtk.Rendering.Core.vtkMapper.newInstance();
        boxMapper.setInputConnection(boxSource.getOutputPort());

        boundingBoxActor = vtk.Rendering.Core.vtkActor.newInstance();
        boundingBoxActor.setMapper(boxMapper);
        boundingBoxActor.getProperty().setColor(1.0, 0, 0);
        boundingBoxActor.getProperty().setRepresentation(1);

        renderer.addActor(boundingBoxActor);
        button.classList.add('active');
    }
    renderWindow.render();
});

document.getElementById('axesBox').addEventListener('click', (event) => {
    const button = event.target;
    if (cubeAxes) {
        renderer.removeActor(cubeAxes);
        cubeAxes = null;
        button.classList.remove('active');
    } else {
        cubeAxes = vtk.Rendering.Core.vtkCubeAxesActor.newInstance();
        cubeAxes.setCamera(renderer.getActiveCamera());
        cubeAxes.setDataBounds(actor.getBounds());
        cubeAxes.getActors().forEach(axis => axis.getProperty().setColor(0, 0, 0));
        renderer.addActor(cubeAxes);
        button.classList.add('active');
    }
    renderWindow.render();
});

const infoButton = document.getElementById('infoButton');
const infoCard = document.getElementById('infoCard');
const closeInfoCard = document.getElementById('closeInfoCard');

infoButton.addEventListener('click', () => {
    infoCard.classList.remove('hidden');
    infoCard.style.display = 'block';
});

closeInfoCard.addEventListener('click', () => {
    infoCard.classList.add('hidden');
    infoCard.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (!infoCard.contains(event.target) && event.target !== infoButton) {
        infoCard.classList.add('hidden');
        infoCard.style.display = 'none';
    }
});

window.addEventListener('resize', () => {
    fullScreenRenderer.resize();
});

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}
