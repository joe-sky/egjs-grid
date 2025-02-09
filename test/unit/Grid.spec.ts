import * as sinon from "sinon";
import { SampleGrid } from "./samples/SampleGrid";
import { cleanup, sandbox, waitEvent, waitFor } from "./utils/utils";


describe("test Grid", () => {
  let grid: SampleGrid | null;
  let container: HTMLElement | null;

  beforeEach(() => {
    container = sandbox("")!;
    container!.style.cssText = "";
  });

  afterEach(() => {
    if (grid) {
      grid.destroy();
    }
    grid = null;
    container = null;
    cleanup();
  });
  describe("test rendering", () => {
    it("should check if items are rendered", async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);


      // When
      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      const children = grid.getChildren();

      // Then
      expect(grid.getItems().length).to.be.equals(3);

      expect(container!.style.height).to.be.equals("54px");
      expect(grid.getOutlines().end).to.be.deep.equals([54]);

      expect(children[0].style.top).to.be.equals("0px");
      expect(children[1].style.top).to.be.equals("18px");
      expect(children[2].style.top).to.be.equals("36px");
    });
    it("should check if items are re-rendered if errors are included", async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div><img /></div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);

      const children = grid.getChildren();

      // When
      grid.renderItems();

      const renderCompleteSpy = sinon.spy();
      const errorSpy = sinon.spy((e) => {
        e.target.remove();
        e.update();
      });

      grid.on("renderComplete", renderCompleteSpy);
      grid.on("contentError", errorSpy);


      children[1].querySelector<HTMLImageElement>("img")!.src = "ERR";

      await waitEvent(grid, "renderComplete");

      // If you call the update function in contentError, rendering occurs once more.
      await waitEvent(grid, "renderComplete");

      // Then
      expect(renderCompleteSpy.callCount).to.be.equals(2);
      expect(errorSpy.callCount).to.be.equals(1);
    });
    it(`should test lazyloading`, async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div><img /></div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);

      const loadingImg= grid.getChildren()[1].querySelector<HTMLImageElement>("img")!;

      loadingImg.setAttribute("loading", "lazy");

      Object.defineProperty(loadingImg, "loading", {
        value: "lazy",
      });
      Object.defineProperty(loadingImg, "complete", {
        value: false,
      });

      grid.renderItems();

      const e1 = await waitEvent(grid, "renderComplete");

      // loading is complete
      loadingImg.src = "complete";

      const e2 = await waitEvent(grid, "renderComplete");

      // Then
      expect(e1.updated.length).to.be.equals(3);
      expect(e2.updated.length).to.be.equals(1);
    });
  });
  describe("test setStatus, getStatus", () => {
    it("Check whether the items are recovered when you call setStatus().", async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);



      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      const outerHTML1 = container!.outerHTML;
      const status = grid.getStatus();

      grid.destroy();

      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;

      grid = new SampleGrid(container!);

      // When
      grid.setStatus(status);
      const outerHTML2 = container!.outerHTML;


      const result = await waitEvent(grid, "renderComplete");

      // Then
      expect(outerHTML1).to.be.equals(outerHTML2);
      expect(result.isResize).to.be.equals(false);
    });
    it(`Check whether the items are recovered but re-rendered when you call setStatus() with resized container.`, async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);

      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      const status = grid.getStatus();

      grid.destroy();

      container!.style.width = "90%";
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;

      grid = new SampleGrid(container!);

      // When
      grid.setStatus(status);


      const result = await waitEvent(grid, "renderComplete");

      // Then
      expect(result.isResize).to.be.equals(true);
    });
  });
  describe("test syncElement() method", () => {
    it("should checks whether the order of items changes when the order of elements changes", async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);

      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      // 1 2 3
      const children1 = grid.getChildren();

      // When
      // 2 1 3
      container!.insertBefore(container!.children[1], container!.children[0]);
      grid.syncElements();

      await waitEvent(grid, "renderComplete");

      // Then
      expect(container!.style.height).to.be.equals("54px");
      expect(grid.getOutlines().end).to.be.deep.equals([54]);

      // 0 => 1
      expect(children1[0].style.top).to.be.equals("18px");
      // 1 => 0
      expect(children1[1].style.top).to.be.equals("0px");
      // 2 => 2
      expect(children1[2].style.top).to.be.equals("36px");
    });
    it("should check if items are added and removed when elements are added and removed", async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!);

      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      // 1 2 3
      const children1 = grid.getChildren();

      // When
      // 2 4 5 3
      const addedElement1 = document.createElement("div");
      const addedElement2 = document.createElement("div");

      addedElement1.innerHTML = "4";
      addedElement2.innerHTML = "5";
      container!.insertBefore(addedElement1, container!.children[2]);
      container!.insertBefore(addedElement2, container!.children[2]);
      children1[0].remove();
      grid.syncElements();

      await waitEvent(grid, "renderComplete");

      const children2 = grid.getChildren();

      // Then
      expect(grid.getItems().length).to.be.deep.equals(4);
      expect(grid.getOutlines().end).to.be.deep.equals([72]);

      expect(children2[0].style.top).to.be.equals("0px");
      expect(children2[1].style.top).to.be.equals("18px");
      expect(children2[2].style.top).to.be.equals("36px");
    });
  });
  describe("test destory() method", () => {
    it(`should checks if destroy is called to return to the original UI`, async () => {
      // Given
      container!.innerHTML = `
      <div style="">1</div>
      <div style="">2</div>
      <div style="">3</div>
      `;
      const outerHTML1 = container!.outerHTML;
      grid = new SampleGrid(container!);
      grid.renderItems();

      await waitEvent(grid, "renderComplete");

      // When
      grid.destroy();
      grid = null;
      const outerHTML2 = container!.outerHTML;


      // Then
      expect(outerHTML1).to.be.equals(outerHTML2);
    });
    it(`should checks whether the UI is preserved if you use the preserveUI option when call destory method.`, async () => {
      // Given
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;

      grid = new SampleGrid(container!);

      grid.renderItems();

      await waitEvent(grid, "renderComplete");
      const outerHTML1 = container!.outerHTML;

      // When
      grid.destroy({
        preserveUI: true,
      });
      grid = null;
      const outerHTML2 = container!.outerHTML;


      // Then
      expect(outerHTML1).to.be.equals(outerHTML2);
    });
  });
  describe("test resizeDebounce, maxResizeDebounce options", () => {
    [50, 100, 150].forEach((resizeDebounce) => {
      it(`should check if it keeps debounce (resizeDebounce: ${resizeDebounce})`, (done) => {
        // Given
        container!.innerHTML = `
        <div>1</div>
        <div>2</div>
        <div>3</div>
        `;
        const spy = sinon.spy();
        grid = new SampleGrid(container!, {
          resizeDebounce,
        });

        grid.on("renderComplete", spy);

        // When
        window.dispatchEvent(new Event("resize"));

        // debounce
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, resizeDebounce - 20);
        // debounce
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, resizeDebounce * 2 - 40);
        // debounce
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, resizeDebounce * 3 - 60);

        // Then
        // The event does not occur until the debounce is over.
        setTimeout(() => {
          expect(spy.callCount).to.be.equals(0);
        }, resizeDebounce * 4 - 80);

        // The event does occur when the debounce is over.
        setTimeout(() => {
          expect(spy.callCount).to.be.equals(1);
          done();
        }, resizeDebounce * 4);
      });
    });
    it("should check maximum debounce time.", (done) => {
      // Given
      const spy = sinon.spy();
      container!.innerHTML = `
      <div>1</div>
      <div>2</div>
      <div>3</div>
      `;
      grid = new SampleGrid(container!, {
        maxResizeDebounce: 200,
      });

      grid.on("renderComplete", spy);

      // When
      window.dispatchEvent(new Event("resize"));

      // debounce
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 60);
      // debounce
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 120);
      // debounce
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 180);

      // Then
      // The maximum time to debounce is 200ms.
      setTimeout(() => {
        expect(spy.callCount).to.be.equals(1);
        done();
      }, 210);
    });
  });

  describe("test dynamic options", () => {
    it("should check if dynamic option works", () => {
      // Given
      grid = new SampleGrid(container!);

      const gap1 = grid.gap;
      const property1 = grid.property;
      const renderProperty1 = grid.renderProperty;

      // When
      grid.gap = 5;
      // default "property1"
      grid.property = "property2";
      // default -1
      grid.renderProperty = 1;

      const gap2 = grid.gap;
      const property2 = grid.property;
      const renderProperty2 = grid.renderProperty;

      // Then
      expect(gap1).to.be.equals(0);
      expect(property1).to.be.equals("property1");
      expect(renderProperty1).to.be.equals(-1);
      expect(gap2).to.be.equals(5);
      expect(property2).to.be.equals("property2");
      expect(renderProperty2).to.be.equals(1);
    });
    it("should check whether to render when the render property changes", async () => {
      // Given
      grid = new SampleGrid(container!);
      const spy = sinon.spy();

      grid.on("renderComplete", spy);


      // When
      grid.renderProperty = 5;

      await waitFor(100);

      // Then
      // pass when renderComplete occurs
      expect(spy.callCount).to.be.equals(1);
    });
    it("should check if the render property changes a lot, but only renders once", async () => {
      // Given
      grid = new SampleGrid(container!);
      const spy = sinon.spy();

      grid.on("renderComplete", spy);


      // When
      grid.renderProperty = 1;
      grid.renderProperty = 2;
      grid.renderProperty = 3;
      grid.gap = 1;


      await waitFor(100);

      // Then
      expect(spy.callCount).to.be.equals(1);
    });
    it(`should checks whether rendering is not possible even if the property changes, not the render property`, async () => {
      // Given
      grid = new SampleGrid(container!);
      const spy = sinon.spy();

      grid.on("renderComplete", spy);


      // When
      grid.property = "11";


      await waitFor(100);

      // Then
      expect(spy.callCount).to.be.equals(0);
    });
    it(`should check if rendering does not occur if the value does not change`, async () => {
      // Given
      grid = new SampleGrid(container!);
      const spy = sinon.spy();

      grid.on("renderComplete", spy);

      // When
      // default -1
      grid.renderProperty = -1;


      await waitFor(100);

      // Then
      expect(spy.callCount).to.be.equals(0);
    });
  });
});

